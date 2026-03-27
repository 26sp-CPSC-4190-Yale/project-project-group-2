import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type { IdRouteContext, UpdateEventBody } from "@/types";

/**
 * Get a single event by ID.
 *
 * Optionally includes related tasks via the `include` query parameter.
 * The event's calendar must belong to the authenticated user.
 *
 * @route   GET /api/events/[id]
 * @query   [include] — comma-separated: "tasks"
 * @returns {ApiResponse<EventResponse>} the event (with optional includes)
 * @error   401 — not authenticated
 * @error   404 — event not found or not accessible
 */
export async function GET(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const include = request.nextUrl.searchParams.get("include");

  const event = await prisma.event.findFirst({
    where: { id, calendar: { userId: session.userId } },
    include: {
      tasks: include?.includes("tasks") ?? false,
    },
  });

  if (!event) return jsonError("Event not found", 404);

  return jsonSuccess(event);
}

/**
 * Update an event's fields.
 *
 * Only the fields present in the body are updated; omitted fields remain
 * unchanged. Send `null` for nullable fields to clear them.
 *
 * @route   PATCH /api/events/[id]
 * @body    {UpdateEventBody}
 * @body    [name]         — new display name
 * @body    [startAt]      — new ISO 8601 start datetime
 * @body    [endAt]        — new end datetime, or null to clear
 * @body    [allDay]       — toggle all-day status
 * @body    [link]         — new URL, or null to clear
 * @body    [description]  — new description, or null to clear
 * @body    [notes]        — new notes, or null to clear
 * @body    [location]     — new location, or null to clear
 * @body    [remindBefore] — new reminder (minutes), or null to clear
 * @body    [calendarId]   — move event to a different calendar
 * @returns {ApiResponse<EventResponse>} the updated event
 * @error   401 — not authenticated
 * @error   404 — event not found or not accessible
 * @error   400 — invalid body
 */
export async function PATCH(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.event.findFirst({
    where: { id, calendar: { userId: session.userId } },
  });
  if (!existing) return jsonError("Event not found", 404);

  let body: UpdateEventBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (body.calendarId) {
    const newCalendar = await prisma.calendar.findFirst({
      where: { id: body.calendarId, userId: session.userId },
    });
    if (!newCalendar) return jsonError("Target calendar not found", 404);
  }

  const event = await prisma.event.update({
    where: { id },
    data: {
      name: body.name,
      startAt: body.startAt ? new Date(body.startAt) : undefined,
      endAt:
        body.endAt === null
          ? null
          : body.endAt
            ? new Date(body.endAt)
            : undefined,
      allDay: body.allDay,
      link: body.link,
      description: body.description,
      notes: body.notes,
      location: body.location,
      remindBefore: body.remindBefore,
      calendarId: body.calendarId,
    },
  });

  return jsonSuccess(event);
}

/**
 * Delete an event and all its related tasks.
 *
 * Cascade-deletes all tasks that belong to this event.
 *
 * @route   DELETE /api/events/[id]
 * @returns {ApiResponse<{ message: string }>} confirmation message
 * @error   401 — not authenticated
 * @error   404 — event not found or not accessible
 */
export async function DELETE(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.event.findFirst({
    where: { id, calendar: { userId: session.userId } },
  });
  if (!existing) return jsonError("Event not found", 404);

  await prisma.event.delete({ where: { id } });

  return jsonSuccess({ message: "Event deleted" });
}
