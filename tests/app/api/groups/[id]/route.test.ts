// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET, PATCH, DELETE } from "@/app/api/groups/[id]/route";
import { prismaMock } from "../../../../helpers/prisma";
import { mockSession } from "../../../../helpers/session";
import { buildNextRequest, buildIdContext } from "../../../../helpers/request";
import { makeCalendar, makeGroup } from "../../../../helpers/factories";

const url = (id: string) => `http://localhost:4000/api/groups/${id}`;

function groupWithCalendar(ownerUserId: string, groupOverrides = {}) {
  const cal = makeCalendar({ id: "c1", userId: ownerUserId });
  return { ...makeGroup({ id: "g1", calendarId: "c1", ...groupOverrides }), calendar: cal };
}

describe("GET /api/groups/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await GET(buildNextRequest({ url: url("g1") }), buildIdContext("g1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when the group does not exist", async () => {
    mockSession("user-1");
    prismaMock.group.findUnique.mockResolvedValue(null as never);
    const res = await GET(buildNextRequest({ url: url("g1") }), buildIdContext("g1"));
    expect(res.status).toBe(404);
  });

  it("returns 403 when the group's calendar belongs to another user", async () => {
    mockSession("user-1");
    prismaMock.group.findUnique.mockResolvedValue(groupWithCalendar("user-2") as never);
    const res = await GET(buildNextRequest({ url: url("g1") }), buildIdContext("g1"));
    expect(res.status).toBe(403);
  });

  it("returns the group on happy path", async () => {
    mockSession("user-1");
    prismaMock.group.findUnique.mockResolvedValue(groupWithCalendar("user-1", { name: "Mine" }) as never);
    const res = await GET(buildNextRequest({ url: url("g1") }), buildIdContext("g1"));
    expect(res.status).toBe(200);
    expect((await res.json()).data.name).toBe("Mine");
  });
});

describe("PATCH /api/groups/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("g1"), body: { name: "x" } }),
      buildIdContext("g1"),
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when the group's calendar belongs to another user", async () => {
    mockSession("user-1");
    prismaMock.group.findUnique.mockResolvedValue(groupWithCalendar("user-2") as never);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("g1"), body: { name: "x" } }),
      buildIdContext("g1"),
    );
    expect(res.status).toBe(403);
  });

  it("updates the group on happy path", async () => {
    mockSession("user-1");
    prismaMock.group.findUnique.mockResolvedValue(groupWithCalendar("user-1") as never);
    prismaMock.group.update.mockResolvedValue(makeGroup({ id: "g1", name: "Updated" }) as never);

    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("g1"), body: { name: "Updated" } }),
      buildIdContext("g1"),
    );

    expect(res.status).toBe(200);
    expect((await res.json()).data.name).toBe("Updated");
  });
});

describe("DELETE /api/groups/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("g1") }), buildIdContext("g1"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when the group's calendar belongs to another user", async () => {
    mockSession("user-1");
    prismaMock.group.findUnique.mockResolvedValue(groupWithCalendar("user-2") as never);
    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("g1") }), buildIdContext("g1"));
    expect(res.status).toBe(403);
  });

  it("deletes the group on happy path", async () => {
    mockSession("user-1");
    prismaMock.group.findUnique.mockResolvedValue(groupWithCalendar("user-1") as never);
    prismaMock.group.delete.mockResolvedValue(makeGroup({ id: "g1" }) as never);

    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("g1") }), buildIdContext("g1"));

    expect(res.status).toBe(200);
    expect((await res.json()).data.message).toBe("Group deleted");
  });
});
