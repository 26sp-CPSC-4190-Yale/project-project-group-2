import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type { CreateTaskBody } from "@/types";

/**
 * List tasks, with optional filters.
 *
 * Returns all tasks belonging to the authenticated user's calendars.
 *
 * @route   GET /api/tasks
 * @query   [calendarId] — only return tasks in this calendar
 * @query   [groupId]    — only return tasks in this group
 * @query   [completed]  — "true" or "false" to filter by completion status
 * @query   [start]      — ISO 8601 date; tasks due on or after
 * @query   [end]        — ISO 8601 date; tasks due on or before
 * @returns {ApiResponse<TaskResponse[]>} array of tasks
 * @error   401 — not authenticated
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const calendarId = searchParams.get("calendarId");
  const groupIds = searchParams.getAll("groupId");
  const completed = searchParams.get("completed");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.userId,
      ...(calendarId && { group: { calendarId } }),
      groupId: groupIds.length > 0 ? { in: groupIds } : { in: [] },
      ...(completed !== null && { completed: completed === "true" }),
      ...(start && { dueAt: { gte: new Date(start) } }),
      ...(end && { dueAt: { lte: new Date(end) } }),
    },
    orderBy: { dueAt: "asc" },
  });

  return jsonSuccess(tasks);
}

/**
 * Create a new task within a calendar.
 *
 * The userId is derived from the session — it is not sent in the body.
 * Every task must belong to a calendar.
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
 * @body    groupId      — the group this task belongs to (required)
 * @body    [eventId]     — the event this task belongs to
 * @returns {ApiResponse<TaskResponse>} the newly created task
 * @error   401 — not authenticated
 * @error   400 — invalid body or missing required fields
 * @error   404 — referenced calendar not found
 * @error   403 — referenced calendar does not belong to the user
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  let body: CreateTaskBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (!body.name) return jsonError("name is required", 400);
  if (!body.dueAt) return jsonError("dueAt is required", 400);

  // Finding groupId for task
  let groupId: string;
  if (body.groupId) {
    const group = await prisma.group.findFirst({
      where: { id: body.groupId, calendar: { userId: session.userId } },
    });
    if (!group) return jsonError("Group not found", 404);
    groupId = group.id;
  } else {
    if (!body.calendarId) return jsonError("calendarId is required when groupId is not provided", 400);
    const defaultGroup = await prisma.group.findFirst({
      where: { calendarId: body.calendarId, isDefault: true },
    });
    if (!defaultGroup) return jsonError("Default group not found", 404);
    groupId = defaultGroup.id;
  }

  const task = await prisma.task.create({
    data: {
      name: body.name,
      dueAt: new Date(body.dueAt),
      allDay: body.allDay,
      notes: body.notes,
      remindBefore: body.remindBefore,
      link: body.link,
      location: body.location,
      groupId,
      userId: session.userId,
    },
  });

  return jsonSuccess(task, 201);
}
