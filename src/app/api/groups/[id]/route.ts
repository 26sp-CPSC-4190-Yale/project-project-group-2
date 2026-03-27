import { NextRequest, NextResponse } from "next/server";
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
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
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
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
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
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
