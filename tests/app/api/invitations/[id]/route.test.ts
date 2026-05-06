// @vitest-environment node
import { describe, expect, it } from "vitest";
import { PATCH, DELETE } from "@/app/api/invitations/[id]/route";
import { prismaMock } from "../../../../helpers/prisma";
import { mockSession } from "../../../../helpers/session";
import { buildNextRequest, buildIdContext } from "../../../../helpers/request";
import {
  makeCalendar,
  makeGroup,
  makeInvitation,
  makeSharedEvent,
} from "../../../../helpers/factories";

const url = (id: string) => `http://localhost:4000/api/invitations/${id}`;

describe("PATCH /api/invitations/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("inv-1"), body: { status: "ACCEPTED" } }),
      buildIdContext("inv-1"),
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when the invitation is not the caller's", async () => {
    mockSession("user-2");
    prismaMock.eventInvitation.findFirst.mockResolvedValue(null as never);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("inv-1"), body: { status: "ACCEPTED" } }),
      buildIdContext("inv-1"),
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when the invitation has already been responded to", async () => {
    mockSession("user-2");
    prismaMock.eventInvitation.findFirst.mockResolvedValue(
      makeInvitation({ id: "inv-1", status: "ACCEPTED", recipientId: "user-2" }) as never,
    );
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("inv-1"), body: { status: "DECLINED" } }),
      buildIdContext("inv-1"),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when status is not ACCEPTED or DECLINED", async () => {
    mockSession("user-2");
    prismaMock.eventInvitation.findFirst.mockResolvedValue(
      makeInvitation({ id: "inv-1", status: "PENDING", recipientId: "user-2" }) as never,
    );
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("inv-1"), body: { status: "BOGUS" } }),
      buildIdContext("inv-1"),
    );
    expect(res.status).toBe(400);
  });

  it("on ACCEPTED: creates a SharedEvent and uses the recipient's default calendar + group", async () => {
    mockSession("user-2");
    prismaMock.eventInvitation.findFirst.mockResolvedValue(
      makeInvitation({
        id: "inv-1",
        status: "PENDING",
        recipientId: "user-2",
        eventId: "e1",
      }) as never,
    );

    const calWithGroup = {
      ...makeCalendar({ id: "c-recipient", userId: "user-2" }),
      groups: [makeGroup({ id: "g-default", isDefault: true })],
    };
    prismaMock.calendar.findFirst.mockResolvedValue(calWithGroup as never);

    prismaMock.$transaction.mockImplementation(async (ops: unknown) =>
      Promise.all(ops as Promise<unknown>[]),
    );
    prismaMock.eventInvitation.update.mockResolvedValue(
      makeInvitation({ id: "inv-1", status: "ACCEPTED" }) as never,
    );
    prismaMock.sharedEvent.create.mockResolvedValue(
      makeSharedEvent({ eventId: "e1", userId: "user-2", groupId: "g-default" }) as never,
    );

    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("inv-1"), body: { status: "ACCEPTED" } }),
      buildIdContext("inv-1"),
    );

    expect(res.status).toBe(200);
    expect(prismaMock.sharedEvent.create).toHaveBeenCalledWith({
      data: { eventId: "e1", userId: "user-2", groupId: "g-default" },
    });
    expect(prismaMock.eventInvitation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "inv-1" },
        data: { status: "ACCEPTED" },
      }),
    );
  });

  it("on DECLINED: updates status but does not create a SharedEvent", async () => {
    mockSession("user-2");
    prismaMock.eventInvitation.findFirst.mockResolvedValue(
      makeInvitation({ id: "inv-1", status: "PENDING", recipientId: "user-2" }) as never,
    );
    prismaMock.eventInvitation.update.mockResolvedValue(
      makeInvitation({ id: "inv-1", status: "DECLINED" }) as never,
    );

    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("inv-1"), body: { status: "DECLINED" } }),
      buildIdContext("inv-1"),
    );

    expect(res.status).toBe(200);
    expect(prismaMock.sharedEvent.create).not.toHaveBeenCalled();
    expect(prismaMock.eventInvitation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "DECLINED" } }),
    );
  });
});

describe("DELETE /api/invitations/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await DELETE(
      buildNextRequest({ method: "DELETE", url: url("inv-1") }),
      buildIdContext("inv-1"),
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when the caller is neither sender nor recipient", async () => {
    mockSession("user-3");
    prismaMock.eventInvitation.findFirst.mockResolvedValue(null as never);
    const res = await DELETE(
      buildNextRequest({ method: "DELETE", url: url("inv-1") }),
      buildIdContext("inv-1"),
    );
    expect(res.status).toBe(404);
  });

  it("removes the linked SharedEvent when deleting an ACCEPTED invitation", async () => {
    mockSession("user-2");
    prismaMock.eventInvitation.findFirst.mockResolvedValue(
      makeInvitation({
        id: "inv-1",
        status: "ACCEPTED",
        senderId: "user-1",
        recipientId: "user-2",
        eventId: "e1",
      }) as never,
    );
    prismaMock.sharedEvent.deleteMany.mockResolvedValue({ count: 1 } as never);
    prismaMock.eventInvitation.delete.mockResolvedValue(
      makeInvitation({ id: "inv-1" }) as never,
    );

    const res = await DELETE(
      buildNextRequest({ method: "DELETE", url: url("inv-1") }),
      buildIdContext("inv-1"),
    );

    expect(res.status).toBe(200);
    expect(prismaMock.sharedEvent.deleteMany).toHaveBeenCalledWith({
      where: { eventId: "e1", userId: "user-2" },
    });
    expect(prismaMock.eventInvitation.delete).toHaveBeenCalledWith({ where: { id: "inv-1" } });
  });

  it("does NOT touch SharedEvent when the invitation was never accepted", async () => {
    mockSession("user-1");
    prismaMock.eventInvitation.findFirst.mockResolvedValue(
      makeInvitation({
        id: "inv-1",
        status: "PENDING",
        senderId: "user-1",
        recipientId: "user-2",
      }) as never,
    );
    prismaMock.eventInvitation.delete.mockResolvedValue(
      makeInvitation({ id: "inv-1" }) as never,
    );

    const res = await DELETE(
      buildNextRequest({ method: "DELETE", url: url("inv-1") }),
      buildIdContext("inv-1"),
    );

    expect(res.status).toBe(200);
    expect(prismaMock.sharedEvent.deleteMany).not.toHaveBeenCalled();
  });
});
