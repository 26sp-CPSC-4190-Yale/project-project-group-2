// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/groups/route";
import { prismaMock } from "../../../helpers/prisma";
import { mockSession } from "../../../helpers/session";
import { buildNextRequest } from "../../../helpers/request";
import { makeCalendar, makeGroup } from "../../../helpers/factories";

const URL = "http://localhost:4000/api/groups";

describe("GET /api/groups", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await GET(buildNextRequest({ url: URL }));
    expect(res.status).toBe(401);
  });

  it("returns 404 when filtering by a calendar id that does not exist", async () => {
    mockSession("user-1");
    prismaMock.calendar.findUnique.mockResolvedValue(null as never);
    const res = await GET(buildNextRequest({ url: URL, searchParams: { calendarId: "c1" } }));
    expect(res.status).toBe(404);
  });

  it("returns 403 when filtering by another user's calendar", async () => {
    mockSession("user-1");
    prismaMock.calendar.findUnique.mockResolvedValue(
      makeCalendar({ id: "c1", userId: "user-2" }) as never,
    );
    const res = await GET(buildNextRequest({ url: URL, searchParams: { calendarId: "c1" } }));
    expect(res.status).toBe(403);
  });

  it("returns groups filtered by calendar on happy path", async () => {
    mockSession("user-1");
    prismaMock.calendar.findUnique.mockResolvedValue(
      makeCalendar({ id: "c1", userId: "user-1" }) as never,
    );
    const groups = [makeGroup({ id: "g1", calendarId: "c1" })];
    prismaMock.group.findMany.mockResolvedValue(groups as never);

    const res = await GET(buildNextRequest({ url: URL, searchParams: { calendarId: "c1" } }));

    expect(res.status).toBe(200);
    expect((await res.json()).data).toHaveLength(1);
    expect(prismaMock.group.findMany).toHaveBeenCalledWith({
      where: { calendar: { userId: "user-1" }, calendarId: "c1" },
      orderBy: { createdAt: "asc" },
    });
  });
});

describe("POST /api/groups", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await POST(
      buildNextRequest({ method: "POST", url: URL, body: { calendarId: "c1" } }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when calendarId is missing", async () => {
    mockSession("user-1");
    const res = await POST(buildNextRequest({ method: "POST", url: URL, body: {} }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when the calendar belongs to another user", async () => {
    mockSession("user-1");
    prismaMock.calendar.findFirst.mockResolvedValue(null as never);
    const res = await POST(
      buildNextRequest({ method: "POST", url: URL, body: { calendarId: "c1" } }),
    );
    expect(res.status).toBe(404);
  });

  it("creates the group on happy path", async () => {
    mockSession("user-1");
    prismaMock.calendar.findFirst.mockResolvedValue(
      makeCalendar({ id: "c1", userId: "user-1" }) as never,
    );
    prismaMock.group.create.mockResolvedValue(
      makeGroup({ id: "g1", calendarId: "c1", name: "Work", color: "blue" }) as never,
    );

    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { calendarId: "c1", name: "Work", color: "blue" },
      }),
    );

    expect(res.status).toBe(201);
    expect((await res.json()).data.name).toBe("Work");
    expect(prismaMock.group.create).toHaveBeenCalledWith({
      data: { calendarId: "c1", name: "Work", notes: undefined, color: "blue" },
    });
  });
});
