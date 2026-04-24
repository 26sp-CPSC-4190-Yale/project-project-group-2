// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/events/route";
import { prismaMock } from "../../../helpers/prisma";
import { mockSession } from "../../../helpers/session";
import { buildNextRequest } from "../../../helpers/request";
import { makeEvent, makeGroup } from "../../../helpers/factories";

const URL = "http://localhost:4000/api/events";

describe("GET /api/events", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await GET(buildNextRequest({ url: URL }));
    expect(res.status).toBe(401);
  });

  it("merges owned events and shared events, sorted by startAt", async () => {
    mockSession("user-1");

    const owned = [
      makeEvent({ id: "e-own", startAt: new Date("2026-01-10T00:00:00Z"), groupId: "g1" }),
    ];
    const shared = [
      {
        id: "se-1",
        userId: "user-1",
        groupId: "g-shared",
        event: makeEvent({
          id: "e-shared",
          startAt: new Date("2026-01-05T00:00:00Z"),
          groupId: "g-other",
        }),
      },
    ];

    prismaMock.event.findMany.mockResolvedValue(owned as never);
    prismaMock.sharedEvent.findMany.mockResolvedValue(shared as never);

    const res = await GET(
      buildNextRequest({
        url: URL,
        searchParams: { calendarId: "c1", groupId: "g1" },
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].id).toBe("e-shared");
    expect(body.data[0].isShared).toBe(true);
    expect(body.data[0].groupId).toBe("g-shared");
    expect(body.data[1].id).toBe("e-own");
  });

  it("filters shared events by the provided date range", async () => {
    mockSession("user-1");
    prismaMock.event.findMany.mockResolvedValue([] as never);
    prismaMock.sharedEvent.findMany.mockResolvedValue([
      {
        id: "se-1",
        userId: "user-1",
        groupId: "g-shared",
        event: makeEvent({ id: "e-early", startAt: new Date("2026-01-01T00:00:00Z") }),
      },
      {
        id: "se-2",
        userId: "user-1",
        groupId: "g-shared",
        event: makeEvent({ id: "e-in-range", startAt: new Date("2026-02-01T00:00:00Z") }),
      },
    ] as never);

    const res = await GET(
      buildNextRequest({
        url: URL,
        searchParams: {
          calendarId: "c1",
          groupId: "g-shared",
          start: "2026-01-15T00:00:00Z",
          end: "2026-02-15T00:00:00Z",
        },
      }),
    );

    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("e-in-range");
  });
});

describe("POST /api/events", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { calendarId: "c1", startAt: "2026-01-01T00:00:00Z" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when calendarId is missing", async () => {
    mockSession("user-1");
    const res = await POST(
      buildNextRequest({ method: "POST", url: URL, body: { startAt: "2026-01-01T00:00:00Z" } }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when startAt is missing", async () => {
    mockSession("user-1");
    const res = await POST(
      buildNextRequest({ method: "POST", url: URL, body: { calendarId: "c1" } }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when the referenced groupId is not in the calendar", async () => {
    mockSession("user-1");
    prismaMock.group.findFirst.mockResolvedValue(null as never);
    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { calendarId: "c1", groupId: "g-missing", startAt: "2026-01-01T00:00:00Z" },
      }),
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 when no default group exists for the calendar", async () => {
    mockSession("user-1");
    prismaMock.group.findFirst.mockResolvedValue(null as never);
    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { calendarId: "c1", startAt: "2026-01-01T00:00:00Z" },
      }),
    );
    expect(res.status).toBe(404);
  });

  it("creates the event using the default group when groupId is not given", async () => {
    mockSession("user-1");
    prismaMock.group.findFirst.mockResolvedValue(makeGroup({ id: "g-default", isDefault: true }) as never);
    prismaMock.event.create.mockResolvedValue(
      makeEvent({ id: "e-new", groupId: "g-default" }) as never,
    );

    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { calendarId: "c1", name: "New", startAt: "2026-01-01T00:00:00Z" },
      }),
    );

    expect(res.status).toBe(201);
    expect((await res.json()).data.id).toBe("e-new");
    expect(prismaMock.event.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ groupId: "g-default", name: "New" }),
    });
  });
});
