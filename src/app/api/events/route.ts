import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type { CreateEventBody } from "@/types";

/**
 * List events, with optional filters.
 *
 * Without filters, returns all events across all of the authenticated
 * user's calendars, plus any shared events the user has accepted.
 * Use the date-range filters (`start`, `end`) to fetch only events
 * relevant to a particular view window.
 *
 * @route   GET /api/events
 * @query   [calendarId] — only return events in this calendar
 * @query   [groupId]    — only return events in this group
 * @query   [start]      — ISO 8601 date; events starting on or after
 * @query   [end]        — ISO 8601 date; events starting on or before
 * @returns {ApiResponse<EventResponse[]>} array of owned + shared events, ordered by start datetime ascending
 * @error   401 — not authenticated
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const calendarId = searchParams.get("calendarId");
  const groupIds = searchParams.getAll("groupId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const events = await prisma.event.findMany({
    where: {
      group: {
        calendar: { userId: session.userId },
        ...(calendarId && { calendarId }),
      },
      ...(groupIds.length > 0 && { groupId: { in: groupIds } }),
      ...(start && { startAt: { gte: new Date(start) } }),
      ...(end && { startAt: { lte: new Date(end) } }),
    },
    include: { group: { select: { color: true } } },
    orderBy: { startAt: "asc" },
  });

  const sharedEventLinks = await prisma.sharedEvent.findMany({
    where: {
      userId: session.userId,
      ...(groupIds.length > 0 && { groupId: { in: groupIds } }),
      ...(calendarId && { group: { calendarId } }),
    },
    include: { event: true, group: { select: { color: true } } },
  });

  const ownedEvents = events.map(({ group, ...e }) => ({ ...e, color: group.color }));

  const sharedEvents = sharedEventLinks
    .filter((se) => {
      const s = se.event.startAt;
      if (start && s < new Date(start)) return false;
      if (end && s > new Date(end)) return false;
      return true;
    })
    .map((se) => ({
      ...se.event,
      groupId: se.groupId,
      isShared: true,
      color: se.group.color,
    }));

  const allEvents = [...ownedEvents, ...sharedEvents].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );

  return jsonSuccess(allEvents);
}

/**
 * Create a new event within a calendar.
 *
 * The calendar must belong to the authenticated user.
 *
 * @route   POST /api/events
 * @body    {CreateEventBody}
 * @body    [name]         — display name (default: "New Event")
 * @body    startAt        — ISO 8601 start datetime (required)
 * @body    [endAt]        — ISO 8601 end datetime
 * @body    [allDay]       — whether this is an all-day event (default: true)
 * @body    [link]         — URL associated with the event
 * @body    [description]  — event description
 * @body    [notes]        — additional notes
 * @body    [location]     — event location
 * @body    [remindBefore] — minutes before event to send a reminder
 * @body    [groupId]      — the group this event belongs to (default: the calendar's default group)
 * @returns {ApiResponse<EventResponse>} the newly created event
 * @error   401 — not authenticated
 * @error   403 — calendar does not belong to the authenticated user
 * @error   400 — invalid body, missing required fields, or invalid dates
 * @error   404 — referenced calendar not found
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  let body: CreateEventBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (!body.calendarId) return jsonError("calendarId is required", 400);
  if (!body.startAt) return jsonError("startAt is required", 400);

  // Finding groupId for event
  let groupId: string;
  if (body.groupId) {
    const group = await prisma.group.findFirst({
      where: { id: body.groupId, calendarId: body.calendarId },
    });
    if (!group) return jsonError("Group not found", 404);
    groupId = group.id;
  } else {
    const defaultGroup = await prisma.group.findFirst({
      where: { calendarId: body.calendarId, isDefault: true },
    });
    if (!defaultGroup) return jsonError("Default group not found", 404);
    groupId = defaultGroup.id;
  }

  const event = await prisma.event.create({
    data: {
      name: body.name,
      startAt: new Date(body.startAt),
      endAt: body.endAt ? new Date(body.endAt) : undefined,
      allDay: body.allDay,
      link: body.link,
      description: body.description,
      notes: body.notes,
      location: body.location,
      remindBefore: body.remindBefore,
      groupId: groupId,
    },
  });

  return jsonSuccess(event, 201);
}
