import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type { IdRouteContext, UpdateCalendarBody } from "@/types";

/**
 * Get a single calendar by ID.
 *
 * Optionally includes related events via the `include` query parameter.
 *
 * @route   GET /api/calendars/[id]
 * @query   [include] — comma-separated: "events"
 * @returns {ApiResponse<CalendarResponse>} the calendar (with optional includes)
 * @error   401 — not authenticated
 * @error   403 — calendar does not belong to the authenticated user
 * @error   404 — calendar not found
 */
export async function GET(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const include = request.nextUrl.searchParams.get("include");

  const calendar = await prisma.calendar.findUnique({
    where: { id },
  });

  if (!calendar) return jsonError("Calendar not found", 404);
  if (calendar.userId !== session.userId) return jsonError("Forbidden", 403);

  return jsonSuccess(calendar);
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
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.calendar.findUnique({ where: { id } });
  if (!existing) return jsonError("Calendar not found", 404);
  if (existing.userId !== session.userId) return jsonError("Forbidden", 403);

  let body: UpdateCalendarBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const calendar = await prisma.calendar.update({
    where: { id },
    data: {
      title: body.title,
      color: body.color,
      description: body.description,
    },
  });

  return jsonSuccess(calendar);
}

/**
 * Delete a calendar and all its related data.
 *
 * Cascade-deletes all events and tasks that belong to this calendar.
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
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.calendar.findUnique({ where: { id } });
  if (!existing) return jsonError("Calendar not found", 404);
  if (existing.userId !== session.userId) return jsonError("Forbidden", 403);

  await prisma.calendar.delete({ where: { id } });

  return jsonSuccess({ message: "Calendar deleted" });
}
