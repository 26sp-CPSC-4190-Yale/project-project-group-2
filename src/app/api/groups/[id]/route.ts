import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type {
  ApiResponse,
  GroupResponse,
  IdRouteContext,
  UpdateGroupBody,
} from "@/types";

/**
 * Get a single group by ID.
 *
 * The group's parent calendar must belong to the authenticated user.
 *
 * @route   GET /api/groups/[id]
 * @returns {ApiResponse<GroupResponse>} the group
 * @error   401 — not authenticated
 * @error   403 — group's calendar does not belong to the authenticated user
 * @error   404 — group not found
 */
export async function GET(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse<ApiResponse<GroupResponse>>> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: { calendar: true },
  });

  if (!group) return jsonError("Group not found", 404);
  if (group.calendar.userId !== session.userId) return jsonError("Forbidden", 403);

  return jsonSuccess(group);
}

/**
 * Update a group's fields.
 *
 * Only the fields present in the body are updated; omitted fields remain
 * unchanged. Send `null` for nullable fields to clear them.
 *
 * @route   PATCH /api/groups/[id]
 * @body    {UpdateGroupBody}
 * @body    [name]  — new display name
 * @body    [color] — new color value
 * @body    [notes] — new notes, or null to clear
 * @returns {ApiResponse<GroupResponse>} the updated group
 * @error   401 — not authenticated
 * @error   403 — group's calendar does not belong to the authenticated user
 * @error   404 — group not found
 * @error   400 — invalid body
 */
export async function PATCH(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse<ApiResponse<GroupResponse>>> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.group.findUnique({
    where: { id },
    include: { calendar: true },
  });

  if (!existing) return jsonError("Group not found", 404);
  if (existing.calendar.userId !== session.userId) return jsonError("Forbidden", 403);

  let body: UpdateGroupBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const group = await prisma.group.update({
    where: { id },
    data: {
      name: body.name,
      color: body.color,
      notes: body.notes,
    },
  });

  return jsonSuccess(group);
}

/**
 * Delete a group and all its categorized data.
 *
 * Cascade-deletes all events and tasks that belong to this group.
 * Events/tasks in the parent calendar that are not in this group are
 * unaffected.
 *
 * @route   DELETE /api/groups/[id]
 * @returns {ApiResponse<{ message: string }>} confirmation message
 * @error   401 — not authenticated
 * @error   403 — group's calendar does not belong to the authenticated user
 * @error   404 — group not found
 */
export async function DELETE(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.group.findUnique({
    where: { id },
    include: { calendar: true },
  });

  if (!existing) return jsonError("Group not found", 404);
  if (existing.calendar.userId !== session.userId) return jsonError("Forbidden", 403);

  await prisma.group.delete({ where: { id } });

  return jsonSuccess({ message: "Group deleted" });
}
