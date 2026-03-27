import { NextRequest, NextResponse } from "next/server";
import type {
  ApiResponse,
  EventResponse,
  IdRouteContext,
  UpdateEventBody,
} from "@/types";

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
 * @error   403 — event's calendar does not belong to the authenticated user
 * @error   404 — event not found
 */
export async function GET(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse<ApiResponse<EventResponse>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
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
 * @body    [groupId]      — reassign group, or null to remove from group
 * @body    [calendarId]   — move event to a different calendar
 * @returns {ApiResponse<EventResponse>} the updated event
 * @error   401 — not authenticated
 * @error   403 — event's calendar does not belong to the authenticated user
 * @error   404 — event not found
 * @error   400 — invalid body or invalid dates
 */
export async function PATCH(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse<ApiResponse<EventResponse>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

/**
 * Delete an event and all its related tasks.
 *
 * Cascade-deletes all tasks that belong to this event.
 *
 * @route   DELETE /api/events/[id]
 * @returns {ApiResponse<{ message: string }>} confirmation message
 * @error   401 — not authenticated
 * @error   403 — event's calendar does not belong to the authenticated user
 * @error   404 — event not found
 */
export async function DELETE(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
