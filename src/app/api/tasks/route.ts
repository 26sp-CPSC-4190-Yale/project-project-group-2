import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, CreateTaskBody, TaskResponse } from "@/types";

/**
 * List tasks, with optional filters.
 *
 * Without filters, returns all tasks owned by the authenticated user
 * (including standalone tasks not assigned to any calendar).
 *
 * @route   GET /api/tasks
 * @query   [calendarId] — only return tasks in this calendar
 * @query   [groupId]    — only return tasks in this group
 * @query   [eventId]    — only return tasks linked to this event
 * @query   [completed]  — "true" or "false" to filter by completion status
 * @query   [start]      — ISO 8601 date; tasks due on or after
 * @query   [end]        — ISO 8601 date; tasks due on or before
 * @returns {ApiResponse<TaskResponse[]>} array of tasks
 * @error   401 — not authenticated
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<TaskResponse[]>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

/**
 * Create a new task.
 *
 * The userId is derived from the session — it is not sent in the body.
 * Tasks may optionally be linked to a calendar, group, and/or event.
 * If linked to an event, the dueAt/allDay fields can mirror the event's
 * start time (handled at the application layer, not automatically).
 *
 * @route   POST /api/tasks
 * @body    {CreateTaskBody}
 * @body    name           — task name/description (required, no default)
 * @body    dueAt          — ISO 8601 due datetime (required)
 * @body    [allDay]       — whether this is an all-day task (default: true)
 * @body    [notes]        — additional notes
 * @body    [remindBefore] — minutes before due to send a reminder
 * @body    [link]         — URL associated with the task
 * @body    [location]     — task location
 * @body    [calendarId]   — optional calendar to assign the task to
 * @body    [groupId]      — optional group to categorize the task
 * @body    [eventId]      — optional event to link the task to
 * @returns {ApiResponse<TaskResponse>} the newly created task
 * @error   401 — not authenticated
 * @error   400 — invalid body or missing required fields
 * @error   404 — referenced calendar, group, or event not found
 * @error   403 — referenced calendar does not belong to the user
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<TaskResponse>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
