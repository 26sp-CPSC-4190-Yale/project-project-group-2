// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/invitations/route";
import { prismaMock } from "../../../helpers/prisma";
import { mockSession } from "../../../helpers/session";
import { buildNextRequest } from "../../../helpers/request";
import { makeEvent, makeInvitation, makeUser } from "../../../helpers/factories";

const URL = "http://localhost:4000/api/invitations";

describe("GET /api/invitations", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await GET(buildNextRequest({ url: URL }));
    expect(res.status).toBe(401);
  });

  it("returns received invitations by default", async () => {
    mockSession("user-1");
    prismaMock.eventInvitation.findMany.mockResolvedValue([] as never);

    await GET(buildNextRequest({ url: URL }));

    expect(prismaMock.eventInvitation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { recipientId: "user-1" } }),
    );
  });

  it("returns sent invitations when type=sent", async () => {
    mockSession("user-1");
    prismaMock.eventInvitation.findMany.mockResolvedValue([] as never);

    await GET(buildNextRequest({ url: URL, searchParams: { type: "sent" } }));

    expect(prismaMock.eventInvitation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { senderId: "user-1" } }),
    );
  });

  it("filters by status when provided", async () => {
    mockSession("user-1");
    prismaMock.eventInvitation.findMany.mockResolvedValue([] as never);

    await GET(buildNextRequest({ url: URL, searchParams: { status: "PENDING" } }));

    expect(prismaMock.eventInvitation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { recipientId: "user-1", status: "PENDING" } }),
    );
  });
});

describe("POST /api/invitations", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { eventId: "e1", recipientEmail: "a@b.com" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when eventId is missing", async () => {
    mockSession("user-1");
    const res = await POST(
      buildNextRequest({ method: "POST", url: URL, body: { recipientEmail: "a@b.com" } }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when recipientEmail is missing", async () => {
    mockSession("user-1");
    const res = await POST(
      buildNextRequest({ method: "POST", url: URL, body: { eventId: "e1" } }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when event is not owned by the sender", async () => {
    mockSession("user-1");
    prismaMock.event.findFirst.mockResolvedValue(null as never);
    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { eventId: "e1", recipientEmail: "a@b.com" },
      }),
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 when recipient email is not a registered user", async () => {
    mockSession("user-1");
    prismaMock.event.findFirst.mockResolvedValue(makeEvent({ id: "e1" }) as never);
    prismaMock.user.findUnique.mockResolvedValue(null as never);
    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { eventId: "e1", recipientEmail: "nope@example.com" },
      }),
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when the recipient is the sender", async () => {
    mockSession("user-1");
    prismaMock.event.findFirst.mockResolvedValue(makeEvent({ id: "e1" }) as never);
    prismaMock.user.findUnique.mockResolvedValue(makeUser({ id: "user-1" }) as never);
    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { eventId: "e1", recipientEmail: "me@example.com" },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 409 when an invitation already exists for this event/recipient pair", async () => {
    mockSession("user-1");
    prismaMock.event.findFirst.mockResolvedValue(makeEvent({ id: "e1" }) as never);
    prismaMock.user.findUnique.mockResolvedValue(makeUser({ id: "user-2" }) as never);
    prismaMock.eventInvitation.findUnique.mockResolvedValue(
      makeInvitation({ id: "dup" }) as never,
    );
    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { eventId: "e1", recipientEmail: "them@example.com" },
      }),
    );
    expect(res.status).toBe(409);
  });

  it("creates the invitation on happy path", async () => {
    mockSession("user-1");
    prismaMock.event.findFirst.mockResolvedValue(makeEvent({ id: "e1" }) as never);
    prismaMock.user.findUnique.mockResolvedValue(makeUser({ id: "user-2" }) as never);
    prismaMock.eventInvitation.findUnique.mockResolvedValue(null as never);
    prismaMock.eventInvitation.create.mockResolvedValue(
      makeInvitation({ id: "inv-new", senderId: "user-1", recipientId: "user-2" }) as never,
    );

    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { eventId: "e1", recipientEmail: "them@example.com" },
      }),
    );

    expect(res.status).toBe(201);
    expect(prismaMock.eventInvitation.create).toHaveBeenCalledWith({
      data: { eventId: "e1", senderId: "user-1", recipientId: "user-2" },
      include: expect.anything(),
    });
  });
});
