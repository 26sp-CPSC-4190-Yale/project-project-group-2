import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type { CreateEventBody } from "@/types";

/**
 * List events, with optional filters.
 *
 * Without filters, returns all events across all of the authenticated
 * user's calendars. Use the date-range filters (`start`, `end`) to
 * fetch only events relevant to a particular view window.
 *
 * @route   GET /api/events
 * @query   [calendarId] — only return events in this calendar
 * @query   [start]      — ISO 8601 date; events starting on or after
 * @query   [end]        — ISO 8601 date; events starting on or before
 * @returns {ApiResponse<EventResponse[]>} array of events
 * @error   401 — not authenticated
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const calendarId = searchParams.get("calendarId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const events = await prisma.event.findMany({
    where: {
      calendar: { userId: session.userId },
      ...(calendarId && { calendarId }),
      ...(start && { startAt: { gte: new Date(start) } }),
      ...(end && { startAt: { lte: new Date(end) } }),
    },
    orderBy: { startAt: "asc" },
  });

  return jsonSuccess(events);
}

/**
 * Create a new event within a calendar.
 *
 * The calendar must belong to the authenticated user.
 *
 * @route   POST /api/events
 * @body    {CreateEventBody}
 * @body    calendarId     — the calendar this event belongs to (required)
 * @body    [name]         — display name (default: "New Event")
 * @body    startAt        — ISO 8601 start datetime (required)
 * @body    [endAt]        — ISO 8601 end datetime
 * @body    [allDay]       — whether this is an all-day event (default: true)
 * @body    [link]         — URL associated with the event
 * @body    [description]  — event description
 * @body    [notes]        — additional notes
 * @body    [location]     — event location
 * @body    [remindBefore] — minutes before event to send a reminder
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

  const calendar = await prisma.calendar.findFirst({
    where: { id: body.calendarId, userId: session.userId },
  });
  if (!calendar) return jsonError("Calendar not found", 404);

  const event = await prisma.event.create({
    data: {
      calendarId: body.calendarId,
      name: body.name,
      startAt: new Date(body.startAt),
      endAt: body.endAt ? new Date(body.endAt) : undefined,
      allDay: body.allDay,
      link: body.link,
      description: body.description,
      notes: body.notes,
      location: body.location,
      remindBefore: body.remindBefore,
    },
  });

  return jsonSuccess(event, 201);
}
