import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type { IdRouteContext, UpdateInvitationBody } from "@/types";

/**
 * Accept or decline an event invitation.
 *
 * Only the recipient can respond. The invitation must still be in
 * PENDING status. When accepted, a SharedEvent link is created so
 * the event appears on the recipient's calendar.
 *
 * @route   PATCH /api/invitations/[id]
 * @body    {UpdateInvitationBody}
 * @body    status — "ACCEPTED" or "DECLINED" (required)
 * @returns {ApiResponse<InvitationResponse>} the updated invitation
 * @error   401 — not authenticated
 * @error   400 — invalid status or invitation already responded to
 * @error   404 — invitation not found or not accessible
 */
export async function PATCH(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.eventInvitation.findFirst({
    where: { id, recipientId: session.userId },
  });
  if (!existing) return jsonError("Invitation not found", 404);

  if (existing.status !== "PENDING") {
    return jsonError("Invitation already responded to", 400);
  }

  let body: UpdateInvitationBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (body.status !== "ACCEPTED" && body.status !== "DECLINED") {
    return jsonError("status must be ACCEPTED or DECLINED", 400);
  }

  if (body.status === "ACCEPTED") {
    let calendar = await prisma.calendar.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "asc" },
      include: { groups: { where: { isDefault: true }, take: 1 } },
    });

    if (!calendar) {
      calendar = await prisma.calendar.create({
        data: { title: "My Calendar", userId: session.userId },
        include: { groups: { where: { isDefault: true }, take: 1 } },
      });
    }

    let groupId: string;
    if (calendar.groups.length > 0) {
      groupId = calendar.groups[0].id;
    } else {
      const defaultGroup = await prisma.group.create({
        data: { calendarId: calendar.id, name: "Default Group", isDefault: true },
      });
      groupId = defaultGroup.id;
    }

    const [updatedInvitation] = await prisma.$transaction([
      prisma.eventInvitation.update({
        where: { id },
        data: { status: "ACCEPTED" },
        include: {
          event: true,
          sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
          recipient: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      }),
      prisma.sharedEvent.create({
        data: {
          eventId: existing.eventId,
          userId: session.userId,
          groupId,
        },
      }),
    ]);

    return jsonSuccess(updatedInvitation);
  }

  const updatedInvitation = await prisma.eventInvitation.update({
    where: { id },
    data: { status: "DECLINED" },
    include: {
      event: true,
      sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
      recipient: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return jsonSuccess(updatedInvitation);
}

/**
 * Withdraw or remove an event invitation.
 *
 * The sender can withdraw a pending invitation; the recipient can
 * remove an accepted/declined invitation. If the invitation was
 * accepted, the corresponding SharedEvent link is also removed.
 *
 * @route   DELETE /api/invitations/[id]
 * @returns {ApiResponse<{ message: string }>} confirmation message
 * @error   401 — not authenticated
 * @error   404 — invitation not found or not accessible
 */
export async function DELETE(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const existing = await prisma.eventInvitation.findFirst({
    where: {
      id,
      OR: [
        { senderId: session.userId },
        { recipientId: session.userId },
      ],
    },
  });
  if (!existing) return jsonError("Invitation not found", 404);

  if (existing.status === "ACCEPTED") {
    await prisma.sharedEvent.deleteMany({
      where: { eventId: existing.eventId, userId: existing.recipientId },
    });
  }

  await prisma.eventInvitation.delete({ where: { id } });

  return jsonSuccess({ message: "Invitation deleted" });
}
