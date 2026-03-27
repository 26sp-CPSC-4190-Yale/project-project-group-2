import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, CreateEventBody, EventResponse } from "@/types";

/**
 * List events, with optional filters.
 *
 * Without filters, returns all events across all of the authenticated
 * user's calendars. Use the date-range filters (`start`, `end`) to
 * fetch only events relevant to a particular view window.
 *
 * @route   GET /api/events
 * @query   [calendarId] — only return events in this calendar
 * @query   [groupId]    — only return events in this group
 * @query   [start]      — ISO 8601 date; events starting on or after
 * @query   [end]        — ISO 8601 date; events starting on or before
 * @returns {ApiResponse<EventResponse[]>} array of events
 * @error   401 — not authenticated
 * @error   403 — referenced calendar/group does not belong to the user
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<EventResponse[]>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

/**
 * Create a new event within a calendar.
 *
 * The calendar must belong to the authenticated user. If a groupId is
 * provided, the group must also belong to the same calendar.
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
 * @body    [groupId]      — optional group to categorize the event
 * @returns {ApiResponse<EventResponse>} the newly created event
 * @error   401 — not authenticated
 * @error   403 — calendar does not belong to the authenticated user
 * @error   400 — invalid body, missing required fields, or invalid dates
 * @error   404 — referenced calendar or group not found
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<EventResponse>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
