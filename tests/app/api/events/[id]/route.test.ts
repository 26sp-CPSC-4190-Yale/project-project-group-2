// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET, PATCH, DELETE } from "@/app/api/events/[id]/route";
import { prismaMock } from "../../../../helpers/prisma";
import { mockSession } from "../../../../helpers/session";
import { buildNextRequest, buildIdContext } from "../../../../helpers/request";
import { makeEvent, makeGroup } from "../../../../helpers/factories";

const url = (id: string) => `http://localhost:4000/api/events/${id}`;

describe("GET /api/events/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await GET(buildNextRequest({ url: url("e1") }), buildIdContext("e1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when the event is not accessible to this user", async () => {
    mockSession("user-1");
    prismaMock.event.findFirst.mockResolvedValue(null as never);
    const res = await GET(buildNextRequest({ url: url("e1") }), buildIdContext("e1"));
    expect(res.status).toBe(404);
  });

  it("returns the event on happy path", async () => {
    mockSession("user-1");
    prismaMock.event.findFirst.mockResolvedValue(makeEvent({ id: "e1", name: "Hi" }) as never);
    const res = await GET(buildNextRequest({ url: url("e1") }), buildIdContext("e1"));
    expect(res.status).toBe(200);
    expect((await res.json()).data.name).toBe("Hi");
  });
});

describe("PATCH /api/events/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("e1"), body: { name: "x" } }),
      buildIdContext("e1"),
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when the event is not accessible", async () => {
    mockSession("user-1");
    prismaMock.event.findFirst.mockResolvedValue(null as never);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("e1"), body: { name: "x" } }),
      buildIdContext("e1"),
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 when the target groupId is not owned by the user", async () => {
    mockSession("user-1");
    prismaMock.event.findFirst.mockResolvedValue(makeEvent({ id: "e1" }) as never);
    prismaMock.group.findFirst.mockResolvedValue(null as never);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("e1"), body: { groupId: "g-other" } }),
      buildIdContext("e1"),
    );
    expect(res.status).toBe(404);
  });

  it("updates the event on happy path and clears endAt when explicitly null", async () => {
    mockSession("user-1");
    prismaMock.event.findFirst.mockResolvedValue(makeEvent({ id: "e1" }) as never);
    prismaMock.event.update.mockResolvedValue(
      makeEvent({ id: "e1", name: "Updated", endAt: null }) as never,
    );

    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("e1"), body: { name: "Updated", endAt: null } }),
      buildIdContext("e1"),
    );

    expect(res.status).toBe(200);
    expect((await res.json()).data.name).toBe("Updated");
    expect(prismaMock.event.update).toHaveBeenCalledWith({
      where: { id: "e1" },
      data: expect.objectContaining({ name: "Updated", endAt: null }),
    });
  });
});

describe("DELETE /api/events/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("e1") }), buildIdContext("e1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when the event is not accessible", async () => {
    mockSession("user-1");
    prismaMock.event.findFirst.mockResolvedValue(null as never);
    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("e1") }), buildIdContext("e1"));
    expect(res.status).toBe(404);
  });

  it("deletes the event on happy path", async () => {
    mockSession("user-1");
    prismaMock.event.findFirst.mockResolvedValue(makeEvent({ id: "e1" }) as never);
    prismaMock.event.delete.mockResolvedValue(makeEvent({ id: "e1" }) as never);

    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("e1") }), buildIdContext("e1"));

    expect(res.status).toBe(200);
    expect((await res.json()).data.message).toBe("Event deleted");
  });
});
