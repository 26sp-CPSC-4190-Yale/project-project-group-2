import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type { CreateCalendarInvitationBody } from "@/types";

/**
 * List calendar invitations for the authenticated user.
 *
 * By default returns received invitations. Use `type=sent` to see
 * invitations the user has sent. Optionally filter by status.
 *
 * @route   GET /api/calendar-invitations
 * @query   [type]   — "sent" or "received" (default: "received")
 * @query   [status] — "PENDING", "ACCEPTED", or "DECLINED"
 * @returns {ApiResponse<CalendarInvitationResponse[]>}
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

  if (status) where.status = status;

  const invitations = await prisma.calendarInvitation.findMany({
    where,
    include: {
      calendar: { select: { id: true, title: true, color: true } },
      sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
      recipient: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonSuccess(invitations);
}

/**
 * Send a calendar invitation to another user by email.
 *
 * The calendar must belong to the authenticated user. The recipient must
 * be a registered user and cannot be the sender themselves.
 *
 * @route   POST /api/calendar-invitations
 * @body    {CreateCalendarInvitationBody}
 * @body    calendarId     — the calendar to share (required)
 * @body    recipientEmail — email of the user to invite (required)
 * @returns {ApiResponse<CalendarInvitationResponse>}
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  let body: CreateCalendarInvitationBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (!body.calendarId) return jsonError("calendarId is required", 400);
  if (!body.recipientEmail) return jsonError("recipientEmail is required", 400);

  const calendar = await prisma.calendar.findFirst({
    where: { id: body.calendarId, userId: session.userId },
  });
  if (!calendar) return jsonError("Calendar not found", 404);

  const recipient = await prisma.user.findUnique({
    where: { email: body.recipientEmail },
  });
  if (!recipient) return jsonError("User not found", 404);

  if (recipient.id === session.userId) return jsonError("Cannot invite yourself", 400);

  const existing = await prisma.calendarInvitation.findUnique({
    where: { calendarId_recipientId: { calendarId: body.calendarId, recipientId: recipient.id } },
  });
  if (existing) return jsonError("Invitation already exists", 409);

  const invitation = await prisma.calendarInvitation.create({
    data: {
      calendarId: body.calendarId,
      senderId: session.userId,
      recipientId: recipient.id,
    },
    include: {
      calendar: { select: { id: true, title: true, color: true } },
      sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
      recipient: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return jsonSuccess(invitation, 201);
}
