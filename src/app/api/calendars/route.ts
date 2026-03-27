import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type { CreateCalendarBody } from "@/types";

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
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const calendars = await prisma.calendar.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return jsonSuccess(calendars);
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
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  let body: CreateCalendarBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const calendar = await prisma.calendar.create({
    data: {
      title: body.title,
      color: body.color,
      description: body.description,
      userId: session.userId,
    },
  });

  return jsonSuccess(calendar, 201);
}
