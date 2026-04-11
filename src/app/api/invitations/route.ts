import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type { CreateInvitationBody } from "@/types";

/**
 * List event invitations for the authenticated user.
 *
 * By default returns received invitations. Use `type=sent` to see
 * invitations the user has sent. Optionally filter by status.
 *
 * @route   GET /api/invitations
 * @query   [type]   — "sent" or "received" (default: "received")
 * @query   [status] — "PENDING", "ACCEPTED", or "DECLINED"
 * @returns {ApiResponse<InvitationResponse[]>} array of invitations
 * @error   401 — not authenticated
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = type === "sent"
    ? { senderId: session.userId }
    : { recipientId: session.userId };

  if (status) {
    where.status = status;
  }

  const invitations = await prisma.eventInvitation.findMany({
    where,
    include: {
      event: true,
      sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
      recipient: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonSuccess(invitations);
}

/**
 * Send an event invitation to another user by email.
 *
 * The event must belong to the authenticated user. The recipient must
 * be a registered user and cannot be the sender themselves.
 *
 * @route   POST /api/invitations
 * @body    {CreateInvitationBody}
 * @body    eventId        — the event to share (required)
 * @body    recipientEmail — email of the user to invite (required)
 * @returns {ApiResponse<InvitationResponse>} the newly created invitation
 * @error   401 — not authenticated
 * @error   400 — missing fields or self-invite
 * @error   404 — event or recipient not found
 * @error   409 — invitation already exists for this event/recipient pair
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  let body: CreateInvitationBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (!body.eventId) return jsonError("eventId is required", 400);
  if (!body.recipientEmail) return jsonError("recipientEmail is required", 400);

  const event = await prisma.event.findFirst({
    where: { id: body.eventId, group: { calendar: { userId: session.userId } } },
  });
  if (!event) return jsonError("Event not found", 404);

  const recipient = await prisma.user.findUnique({
    where: { email: body.recipientEmail },
  });
  if (!recipient) return jsonError("User not found", 404);

  if (recipient.id === session.userId) {
    return jsonError("Cannot invite yourself", 400);
  }

  const existing = await prisma.eventInvitation.findUnique({
    where: { eventId_recipientId: { eventId: body.eventId, recipientId: recipient.id } },
  });
  if (existing) return jsonError("Invitation already exists", 409);

  const invitation = await prisma.eventInvitation.create({
    data: {
      eventId: body.eventId,
      senderId: session.userId,
      recipientId: recipient.id,
    },
    include: {
      event: true,
      sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
      recipient: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return jsonSuccess(invitation, 201);
}
