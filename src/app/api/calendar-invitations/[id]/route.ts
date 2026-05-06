import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";
import type { IdRouteContext, UpdateCalendarInvitationBody } from "@/types";

/**
 * Accept or decline a calendar invitation.
 *
 * On ACCEPTED: deep-copies the calendar (with all its groups, events, and
 * tasks) into the recipient's account as a new independent calendar.
 *
 * @route   PATCH /api/calendar-invitations/[id]
 * @body    {UpdateCalendarInvitationBody}
 * @body    status — "ACCEPTED" or "DECLINED"
 * @returns {ApiResponse<CalendarInvitationResponse>}
 */
export async function PATCH(
  request: NextRequest,
  context: IdRouteContext,
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;

  const invitation = await prisma.calendarInvitation.findFirst({
    where: { id, recipientId: session.userId },
  });
  if (!invitation) return jsonError("Invitation not found", 404);

  if (invitation.status !== "PENDING") {
    return jsonError("Invitation has already been responded to", 400);
  }

  let body: UpdateCalendarInvitationBody;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (body.status !== "ACCEPTED" && body.status !== "DECLINED") {
    return jsonError("status must be ACCEPTED or DECLINED", 400);
  }

  if (body.status === "DECLINED") {
    const updated = await prisma.calendarInvitation.update({
      where: { id },
      data: { status: "DECLINED" },
      include: {
        calendar: { select: { id: true, title: true, color: true } },
        sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
        recipient: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
    return jsonSuccess(updated);
  }

  const original = await prisma.calendar.findFirst({
    where: { id: invitation.calendarId },
    include: {
      groups: {
        include: {
          events: true,
          tasks: true,
        },
      },
    },
  });

  if (!original) return jsonError("Original calendar no longer exists", 404);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.calendar.create({
      data: {
        title: original.title,
        color: original.color,
        description: original.description,
        isDefault: false,
        userId: session.userId,
        groups: {
          create: original.groups.map((group) => ({
            name: group.name,
            color: group.color,
            notes: group.notes,
            isDefault: group.isDefault,
            events: {
              create: group.events.map((event) => ({
                name: event.name,
                startAt: event.startAt,
                endAt: event.endAt,
                allDay: event.allDay,
                link: event.link,
                description: event.description,
                notes: event.notes,
                location: event.location,
                remindBefore: event.remindBefore,
              })),
            },
            tasks: {
              create: group.tasks.map((task) => ({
                name: task.name,
                dueAt: task.dueAt,
                allDay: task.allDay,
                notes: task.notes,
                link: task.link,
                location: task.location,
                remindBefore: task.remindBefore,
                userId: session.userId,
              })),
            },
          })),
        },
      },
    });

    return tx.calendarInvitation.update({
      where: { id },
      data: { status: "ACCEPTED" },
      include: {
        calendar: { select: { id: true, title: true, color: true } },
        sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
        recipient: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  });

  return jsonSuccess(updated);
}
