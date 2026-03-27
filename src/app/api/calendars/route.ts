import { NextRequest, NextResponse } from "next/server";
import type {
  ApiResponse,
  CalendarResponse,
  CreateCalendarBody,
} from "@/types";

/**
 * List all calendars for the authenticated user.
 *
 * Returns every calendar owned by the current user, ordered by creation
 * date (newest first).
 *
 * @route   GET /api/calendars
 * @returns {ApiResponse<CalendarResponse[]>} array of the user's calendars
 * @error   401 — not authenticated
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<CalendarResponse[]>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

/**
 * Create a new calendar for the authenticated user.
 *
 * The userId is derived from the session — it is not sent in the body.
 * All body fields are optional and fall back to schema defaults.
 *
 * @route   POST /api/calendars
 * @body    {CreateCalendarBody}
 * @body    [title]       — display name (default: "Calendar")
 * @body    [color]       — hex color or name (default: "none")
 * @body    [description] — optional description text
 * @returns {ApiResponse<CalendarResponse>} the newly created calendar
 * @error   401 — not authenticated
 * @error   400 — invalid body
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<CalendarResponse>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
