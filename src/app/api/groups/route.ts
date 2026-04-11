import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type { ApiResponse, CreateGroupBody, GroupResponse } from "@/types";

/**
 * List groups, optionally filtered by calendar.
 *
 * Without a `calendarId` filter, returns all groups across all of the
 * authenticated user's calendars.
 *
 * @route   GET /api/groups
 * @query   [calendarId] — only return groups belonging to this calendar
 * @returns {ApiResponse<GroupResponse[]>} array of groups
 * @error   401 — not authenticated
 * @error   403 — calendarId does not belong to the authenticated user
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<GroupResponse[]>>> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const calendarId = request.nextUrl.searchParams.get("calendarId");

  if (calendarId) {
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    });
    if (!calendar) return jsonError("Calendar not found", 404);
    if (calendar.userId !== session.userId) return jsonError("Forbidden", 403);
  }

  const groups = await prisma.group.findMany({
    where: {
      calendar: { userId: session.userId },
      ...(calendarId && { calendarId }),
    },
    orderBy: { createdAt: "asc" },
  });

  return jsonSuccess(groups);
}

/**
 * Create a new group within a calendar.
 *
 * The calendar must belong to the authenticated user.
 *
 * @route   POST /api/groups
 * @body    {CreateGroupBody}
 * @body    calendarId — the calendar this group belongs to (required)
 * @body    [name]     — display name (default: "Group")
 * @body    [color]    — hex color or name (default: "none")
 * @body    [notes]    — optional notes/description
 * @returns {ApiResponse<GroupResponse>} the newly created group
 * @error   401 — not authenticated
 * @error   403 — calendar does not belong to the authenticated user
 * @error   400 — invalid body or missing calendarId
 * @error   404 — referenced calendar not found
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<GroupResponse>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
