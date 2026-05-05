import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api";
import { openai, CHAT_MODEL, OPENAI_TIMEOUT_MS } from "@/lib/openai";
import { rateLimit } from "@/lib/aiRateLimit";
import {
  scheduleEventSchema, askClarificationSchema,
  type ScheduleEventArgs, type AskClarificationArgs,
} from "@/lib/aiSchemas";
import type { AiChatRequestBody, AiChatResponseBody } from "@/types";

/**
 * Chat API — free-slot scheduling assistant.
 *
 * Fetches the selected calendar's existing events for the next 30 days,
 * passes them to the model, and lets the AI find the first available slot
 * that fits the user's request before calling schedule_event.
 *
 * @route   POST /api/ai/chat
 * @body    {AiChatRequestBody}
 * @error   401 - not authenticated
 * @error   429 - too many requests
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!rateLimit(`chat:${session.userId}`, 30)) {
    return jsonError("Too many requests", 429);
  }

  let body: AiChatRequestBody;
  try { body = await req.json(); } catch { return jsonError("Invalid JSON", 400); }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonError("messages required", 400);
  }

  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + 30);

  const [calendars, existingEvents] = await Promise.all([
    prisma.calendar.findMany({
      where: { userId: session.userId },
      include: { groups: { select: { id: true, name: true, isDefault: true } } },
      orderBy: { createdAt: "asc" },
    }),
    body.context.selectedCalendarId
      ? prisma.event.findMany({
          where: {
            group: { calendar: { id: body.context.selectedCalendarId, userId: session.userId } },
            startAt: { gte: now, lte: windowEnd },
          },
          select: { name: true, startAt: true, endAt: true, allDay: true },
          orderBy: { startAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const systemPrompt = buildSystemPrompt({
    now: body.context.currentDateISO,
    timezone: body.context.timezone,
    calendars,
    selectedCalendarId: body.context.selectedCalendarId,
    existingEvents,
  });

  const response = await openai.responses.create({
    model: CHAT_MODEL,
    input: [
      { role: "system", content: systemPrompt },
      ...body.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    tools: [
      { type: "function", name: "schedule_event",   description: "Schedule an event into a specific free slot. Only call this after identifying a free block that fits.",  strict: true, parameters: scheduleEventSchema },
      { type: "function", name: "ask_clarification", description: "Ask the user for missing info (event name, desired date range, duration, etc.) before scheduling.", strict: true, parameters: askClarificationSchema },
    ],
    tool_choice: "auto",
  }, { timeout: OPENAI_TIMEOUT_MS });

  for (const item of response.output) {
    if (item.type === "function_call") {
      return jsonSuccess(await handleToolCall(item, { userId: session.userId, calendars }));
    }
    if (item.type === "message") {
      const textPart = item.content.find((c) => c.type === "output_text");
      if (textPart) return jsonSuccess({ kind: "text", text: textPart.text } satisfies AiChatResponseBody);
      const refusal = item.content.find((c) => c.type === "refusal");
      if (refusal) return jsonSuccess({ kind: "error", message: `Assistant declined: ${refusal.refusal}` } satisfies AiChatResponseBody);
    }
  }
  return jsonSuccess({ kind: "error", message: "Empty response from model." } satisfies AiChatResponseBody);
}

// ---------------------------------------------------------------------------
// Handle Tool Calls

async function handleToolCall(
  item: { name: string; arguments: string; call_id: string },
  ctx: { userId: string; calendars: Array<{ id: string; title: string; groups: { id: string; name: string; isDefault: boolean }[] }> },
): Promise<AiChatResponseBody> {
  const args = JSON.parse(item.arguments);

  if (item.name === "ask_clarification") {
    return { kind: "question", text: (args as AskClarificationArgs).question };
  }

  if (item.name === "schedule_event") {
    const a = args as ScheduleEventArgs;

    const calendar = ctx.calendars.find((c) => c.id === a.calendarId);
    if (!calendar) return { kind: "error", message: "The assistant referenced an unknown calendar." };

    const group = a.groupId
      ? calendar.groups.find((g) => g.id === a.groupId)
      : calendar.groups.find((g) => g.isDefault);
    if (!group) return { kind: "error", message: `No matching group found in ${calendar.title}.` };

    return {
      kind: "proposal",
      proposalKind: "event",
      data: {
        calendarId: calendar.id,
        groupId: group.id,
        name: a.name,
        startAt: a.startAtISO,
        endAt: a.endAtISO,
        allDay: false,
        description: a.description ?? undefined,
        location: a.location ?? undefined,
        link: a.link ?? undefined,
        remindBefore: a.remindBeforeMinutes ?? undefined,
        displayCalendarTitle: calendar.title,
        displayGroupName: group.name,
      },
    };
  }

  return { kind: "error", message: `Unknown tool: ${item.name}` };
}

// ---------------------------------------------------------------------------
// Build System Prompt

function buildSystemPrompt(args: {
  now: string;
  timezone: string;
  calendars: Array<{ id: string; title: string; groups: { id: string; name: string; isDefault: boolean }[] }>;
  selectedCalendarId: string | null;
  existingEvents: Array<{ name: string; startAt: Date; endAt: Date | null; allDay: boolean }>;
}) {
  const calSummary = args.calendars.map((c) => ({
    id: c.id,
    title: c.title,
    defaultGroupId: c.groups.find((g) => g.isDefault)?.id,
    groups: c.groups.map((g) => ({ id: g.id, name: g.name })),
  }));

  const eventLines = args.existingEvents.map((e) => {
    const start = e.startAt.toISOString();
    const end = e.endAt ? e.endAt.toISOString() : "no end time";
    return e.allDay ? `  - ${e.name} (all-day on ${start.slice(0, 10)})` : `  - ${e.name}: ${start} → ${end}`;
  });

  return [
    "You are a scheduling assistant. Your only job is to find free time slots in the user's calendar and schedule events into them.",
    `Current datetime: ${args.now}. User timezone: ${args.timezone}.`,
    `The user is viewing calendar: ${args.selectedCalendarId ?? "(none)"}.`,
    "",
    "RULES:",
    "- Default schedulable window: 9am–5pm in the user's timezone.",
    "- Default event duration: 1 hour if the user does not specify.",
    "- If the user specifies off-limit times (e.g. 'no meetings before 10am'), respect those for the entire conversation.",
    "- Pick the FIRST available slot that fits the requested duration within the requested date range.",
    "- If no free slot exists, call ask_clarification to tell the user and ask for an alternative.",
    "- If any required detail is missing (event name, date range), call ask_clarification first.",
    "- Never invent calendar or group IDs. Only use values from the CALENDARS list below.",
    "- Always set allDay: false for scheduled events.",
    "- Emit startAtISO and endAtISO in ISO 8601 with the user's timezone offset.",
    "",
    "EXISTING EVENTS (next 30 days):",
    eventLines.length > 0 ? eventLines.join("\n") : "  (none)",
    "",
    "CALENDARS:",
    JSON.stringify(calSummary, null, 2),
  ].join("\n");
}
