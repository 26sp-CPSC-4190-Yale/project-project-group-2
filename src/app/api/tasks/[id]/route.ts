import { NextRequest, NextResponse } from "next/server";
import type {
  ApiResponse,
  IdRouteContext,
  TaskResponse,
  UpdateTaskBody,
} from "@/types";

/**
 * Get a single task by ID.
 *
 * The task must belong to the authenticated user.
 *
 * @route   GET /api/tasks/[id]
 * @returns {ApiResponse<TaskResponse>} the task
 * @error   401 — not authenticated
 * @error   403 — task does not belong to the authenticated user
 * @error   404 — task not found
 */
export async function GET(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse<ApiResponse<TaskResponse>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
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
 * @body    [calendarId]   — reassign calendar, or null to make standalone
 * @body    [groupId]      — reassign group, or null to remove from group
 * @body    [eventId]      — reassign event, or null to unlink from event
 * @returns {ApiResponse<TaskResponse>} the updated task
 * @error   401 — not authenticated
 * @error   403 — task does not belong to the authenticated user
 * @error   404 — task not found
 * @error   400 — invalid body
 */
export async function PATCH(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse<ApiResponse<TaskResponse>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

/**
 * Delete a task.
 *
 * @route   DELETE /api/tasks/[id]
 * @returns {ApiResponse<{ message: string }>} confirmation message
 * @error   401 — not authenticated
 * @error   403 — task does not belong to the authenticated user
 * @error   404 — task not found
 */
export async function DELETE(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
