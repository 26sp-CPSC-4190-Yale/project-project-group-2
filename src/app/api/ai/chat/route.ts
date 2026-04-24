import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api";
import { openai, CHAT_MODEL, OPENAI_TIMEOUT_MS } from "@/lib/openai";
import { rateLimit } from "@/lib/aiRateLimit";
import {
  proposedEventSchema, proposedTaskSchema, askClarificationSchema,
  type ProposedEventArgs, type ProposedTaskArgs, type AskClarificationArgs,
} from "@/lib/aiSchemas";
import type { AiChatRequestBody, AiChatResponseBody } from "@/types";


/**
 * Chat API
 *
 * The userId is derived from the session — it is not sent in the body.
 * All body fields are optional and fall back to schema defaults.
 *
 * @route   POST /api/ai/chat
 * @body    {AiChatRequestBody}
 * @body    messages - array of messages
 * @body    context - page context
 * @returns {AiChatResponseBody} the response body
 * @error   401 - not authenticated
 * @error   400 - invalid body or missing required fields
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

  // Load user context so the LLM has real IDs to reference.
  const calendars = await prisma.calendar.findMany({
    where: { userId: session.userId },
    include: { groups: { select: { id: true, name: true, isDefault: true } } },
    orderBy: { createdAt: "asc" },
  });
  
  const systemPrompt = buildSystemPrompt({
    now: body.context.currentDateISO,
    timezone: body.context.timezone,
    calendars,
    selectedCalendarId: body.context.selectedCalendarId,
  });

  const response = await openai.responses.create({
    model: CHAT_MODEL,
    input: [
      { role: "system", content: systemPrompt },
      ...body.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    tools: [
      { type: "function", name: "propose_event",       description: "Propose a calendar event. User will review and confirm.", strict: true, parameters: proposedEventSchema },
      { type: "function", name: "propose_task",        description: "Propose a task with a due date.",                          strict: true, parameters: proposedTaskSchema },
      { type: "function", name: "ask_clarification",   description: "Ask the user for missing info before proposing.",          strict: true, parameters: askClarificationSchema },
    ],
    tool_choice: "auto",
  }, { timeout: OPENAI_TIMEOUT_MS });

  // Walk response.output for the first function_call or message item.
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

// Helper functions below

// ---------------------------------------------------------------------------
// Handle Tool Calls
async function handleToolCall(
    item: { name: string; arguments: string; call_id: string },
    ctx: { userId: string; calendars: Array<{ id: string; title: string; groups: { id: string; name: string; isDefault: boolean }[] }> },
  ): Promise<AiChatResponseBody> {
    const args = JSON.parse(item.arguments); // strict mode guarantees parseable
  
    if (item.name === "ask_clarification") {
      return { kind: "question", text: (args as AskClarificationArgs).question };
    }
  
    const calendar = ctx.calendars.find((c) => c.id === args.calendarId);
    if (!calendar) {
      return { kind: "error", message: `The assistant referenced an unknown calendar.` };
    }
    const group = args.groupId
      ? calendar.groups.find((g) => g.id === args.groupId)
      : calendar.groups.find((g) => g.isDefault);
    if (!group) {
      return { kind: "error", message: `No matching group found in ${calendar.title}.` };
    }
  
    if (item.name === "propose_event") {
      const a = args as ProposedEventArgs;
      return {
        kind: "proposal",
        proposalKind: "event",
        data: {
          calendarId: calendar.id,
          groupId: group.id,
          name: a.name,
          startAt: a.startAtISO,
          endAt: a.endAtISO ?? undefined,
          allDay: a.allDay,
          description: a.description ?? undefined,
          location: a.location ?? undefined,
          link: a.link ?? undefined,
          remindBefore: a.remindBeforeMinutes ?? undefined,
          displayCalendarTitle: calendar.title,
          displayGroupName: group.name,
        },
      };
    }
    if (item.name === "propose_task") {
      const a = args as ProposedTaskArgs;
      return {
        kind: "proposal",
        proposalKind: "task",
        data: {
          calendarId: calendar.id,
          groupId: group.id,
          name: a.name,
          dueAt: a.dueAtISO,
          allDay: a.allDay,
          notes: a.notes ?? undefined,
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
    now: string; timezone: string;
    calendars: Array<{ id: string; title: string; groups: { id: string; name: string; isDefault: boolean }[] }>;
    selectedCalendarId: string | null;
  }) {
    const calSummary = args.calendars.map((c) => ({
      id: c.id,
      title: c.title,
      defaultGroupId: c.groups.find((g) => g.isDefault)?.id,
      groups: c.groups.map((g) => ({ id: g.id, name: g.name })),
    }));
    return [
      "You are a calendar assistant inside a scheduling web app.",
      `Current datetime: ${args.now}. User timezone: ${args.timezone}.`,
      `The user is currently viewing calendar: ${args.selectedCalendarId ?? "(none)"}.`,
      "When the user describes an event or task, call propose_event or propose_task.",
      "If any required detail is missing (e.g. date, calendar when multiple exist), call ask_clarification instead of guessing.",
      "Never invent IDs. Only use calendarId and groupId values from the CALENDARS list below.",
      "Interpret relative dates ('tomorrow', 'next Friday') using the current datetime and timezone. Emit startAtISO / dueAtISO in ISO 8601 with timezone offset.",
      "Prefer allDay: true unless the user specifies a time.",
      "",
      "CALENDARS:",
      JSON.stringify(calSummary, null, 2),
    ].join("\n");
  }
