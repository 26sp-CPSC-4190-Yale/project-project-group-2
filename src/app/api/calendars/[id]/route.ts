import { NextRequest, NextResponse } from "next/server";
import type {
  ApiResponse,
  CalendarResponse,
  IdRouteContext,
  UpdateCalendarBody,
} from "@/types";

/**
 * Get a single calendar by ID.
 *
 * Optionally includes related groups and/or events via the `include`
 * query parameter.
 *
 * @route   GET /api/calendars/[id]
 * @query   [include] — comma-separated: "groups", "events", "groups,events"
 * @returns {ApiResponse<CalendarResponse>} the calendar (with optional includes)
 * @error   401 — not authenticated
 * @error   403 — calendar does not belong to the authenticated user
 * @error   404 — calendar not found
 */
export async function GET(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse<ApiResponse<CalendarResponse>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

/**
 * Update a calendar's fields.
 *
 * Only the fields present in the body are updated; omitted fields remain
 * unchanged. Send `null` for nullable fields to clear them.
 *
 * @route   PATCH /api/calendars/[id]
 * @body    {UpdateCalendarBody}
 * @body    [title]       — new display name
 * @body    [color]       — new color value
 * @body    [description] — new description, or null to clear
 * @returns {ApiResponse<CalendarResponse>} the updated calendar
 * @error   401 — not authenticated
 * @error   403 — calendar does not belong to the authenticated user
 * @error   404 — calendar not found
 * @error   400 — invalid body
 */
export async function PATCH(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse<ApiResponse<CalendarResponse>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

/**
 * Delete a calendar and all its related data.
 *
 * Cascade-deletes all groups, events, and tasks that belong to this
 * calendar.
 *
 * @route   DELETE /api/calendars/[id]
 * @returns {ApiResponse<{ message: string }>} confirmation message
 * @error   401 — not authenticated
 * @error   403 — calendar does not belong to the authenticated user
 * @error   404 — calendar not found
 */
export async function DELETE(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
