import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type { IdRouteContext, UpdateTaskBody } from "@/types";

/**
 * Get a single task by ID.
 *
 * The task's calendar must belong to the authenticated user.
 *
 * @route   GET /api/tasks/[id]
 * @returns {ApiResponse<TaskResponse>} the task
 * @error   401 — not authenticated
 * @error   404 — task not found or not accessible
 */
export async function GET(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const task = await prisma.task.findFirst({
    where: { id, calendar: { userId: session.userId } },
  });

  if (!task) return jsonError("Task not found", 404);

  return jsonSuccess(task);
}

/**
 * Update a task's fields.
 *
 * Only the fields present in the body are updated; omitted fields remain
 * unchanged. Send `null` for nullable fields to clear them. Use
 * `completed: true/false` to toggle completion status.
 *
 * @route   PATCH /api/tasks/[id]
 * @body    {UpdateTaskBody}
 * @body    [name]         — new task name
 * @body    [dueAt]        — new ISO 8601 due datetime
 * @body    [allDay]       — toggle all-day status
 * @body    [completed]    — toggle completion status
 * @body    [notes]        — new notes, or null to clear
 * @body    [remindBefore] — new reminder (minutes), or null to clear
 * @body    [link]         — new URL, or null to clear
 * @body    [location]     — new location, or null to clear
 * @body    [calendarId]   — move task to a different calendar
 * @returns {ApiResponse<TaskResponse>} the updated task
 * @error   401 — not authenticated
 * @error   404 — task not found or not accessible
 * @error   400 — invalid body
 */
export async function PATCH(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.task.findFirst({
    where: { id, calendar: { userId: session.userId } },
  });
  if (!existing) return jsonError("Task not found", 404);

  let body: UpdateTaskBody;
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

  const task = await prisma.task.update({
    where: { id },
    data: {
      name: body.name,
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
      allDay: body.allDay,
      completed: body.completed,
      notes: body.notes,
      remindBefore: body.remindBefore,
      link: body.link,
      location: body.location,
      calendarId: body.calendarId,
    },
  });

  return jsonSuccess(task);
}

/**
 * Delete a task.
 *
 * @route   DELETE /api/tasks/[id]
 * @returns {ApiResponse<{ message: string }>} confirmation message
 * @error   401 — not authenticated
 * @error   404 — task not found or not accessible
 */
export async function DELETE(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.task.findFirst({
    where: { id, calendar: { userId: session.userId } },
  });
  if (!existing) return jsonError("Task not found", 404);

  await prisma.task.delete({ where: { id } });

  return jsonSuccess({ message: "Task deleted" });
}
