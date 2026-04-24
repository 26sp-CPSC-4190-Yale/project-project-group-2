// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/calendars/route";
import { prismaMock } from "../../../helpers/prisma";
import { mockSession } from "../../../helpers/session";
import { buildNextRequest } from "../../../helpers/request";
import { makeCalendar, makeGroup } from "../../../helpers/factories";

const URL = "http://localhost:4000/api/calendars";

describe("GET /api/calendars", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await GET(buildNextRequest({ url: URL }));
    expect(res.status).toBe(401);
  });

  it("returns the caller's calendars, newest first", async () => {
    mockSession("user-1");
    const cals = [makeCalendar({ id: "c1" }), makeCalendar({ id: "c2" })];
    prismaMock.calendar.findMany.mockResolvedValue(cals as never);

    const res = await GET(buildNextRequest({ url: URL }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: cals.map((c) => JSON.parse(JSON.stringify(c))) });
    expect(prismaMock.calendar.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("POST /api/calendars", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await POST(
      buildNextRequest({ method: "POST", url: URL, body: { title: "x" } }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is not JSON", async () => {
    mockSession("user-1");
    const req = buildNextRequest({ method: "POST", url: URL });
    // Override with a non-JSON body that will fail `request.json()`
    const bad = new Request(URL, { method: "POST", body: "not json" });
    const res = await POST(bad as never);
    expect(res.status).toBe(400);
  });

  it("creates the calendar and a default group on success", async () => {
    mockSession("user-1");
    const cal = makeCalendar({ id: "new-cal", userId: "user-1", title: "Work" });
    prismaMock.calendar.create.mockResolvedValue(cal as never);
    prismaMock.group.create.mockResolvedValue(
      makeGroup({ calendarId: "new-cal", isDefault: true }) as never,
    );

    const res = await POST(
      buildNextRequest({ method: "POST", url: URL, body: { title: "Work", color: "blue" } }),
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.id).toBe("new-cal");
    expect(body.data.title).toBe("Work");

    expect(prismaMock.calendar.create).toHaveBeenCalledWith({
      data: { title: "Work", color: "blue", description: undefined, userId: "user-1" },
    });
    expect(prismaMock.group.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        calendarId: "new-cal",
        name: "Default Group",
        isDefault: true,
      }),
    });
  });
});
