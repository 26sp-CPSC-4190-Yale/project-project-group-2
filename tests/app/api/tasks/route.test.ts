// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/tasks/route";
import { prismaMock } from "../../../helpers/prisma";
import { mockSession } from "../../../helpers/session";
import { buildNextRequest } from "../../../helpers/request";
import { makeGroup, makeTask } from "../../../helpers/factories";

const URL = "http://localhost:4000/api/tasks";

describe("GET /api/tasks", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await GET(buildNextRequest({ url: URL }));
    expect(res.status).toBe(401);
  });

  it("returns the user's tasks, ordered by dueAt", async () => {
    mockSession("user-1");
    const tasks = [makeTask({ id: "t1", userId: "user-1" })];
    prismaMock.task.findMany.mockResolvedValue(tasks as never);

    const res = await GET(buildNextRequest({ url: URL, searchParams: { groupId: "g1" } }));

    expect(res.status).toBe(200);
    expect((await res.json()).data).toHaveLength(1);
    expect(prismaMock.task.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ userId: "user-1", groupId: { in: ["g1"] } }),
      orderBy: { dueAt: "asc" },
    });
  });

  it("filters by completion status when completed=true is provided", async () => {
    mockSession("user-1");
    prismaMock.task.findMany.mockResolvedValue([] as never);

    await GET(
      buildNextRequest({ url: URL, searchParams: { groupId: "g1", completed: "true" } }),
    );

    expect(prismaMock.task.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ completed: true }),
      orderBy: { dueAt: "asc" },
    });
  });
});

describe("POST /api/tasks", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await POST(
      buildNextRequest({ method: "POST", url: URL, body: { name: "x", dueAt: "2026-01-01" } }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when name is missing", async () => {
    mockSession("user-1");
    const res = await POST(
      buildNextRequest({ method: "POST", url: URL, body: { dueAt: "2026-01-01" } }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when dueAt is missing", async () => {
    mockSession("user-1");
    const res = await POST(
      buildNextRequest({ method: "POST", url: URL, body: { name: "t" } }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when neither groupId nor calendarId is provided", async () => {
    mockSession("user-1");
    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { name: "t", dueAt: "2026-01-01T00:00:00Z" },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when the referenced groupId is not owned by the user", async () => {
    mockSession("user-1");
    prismaMock.group.findFirst.mockResolvedValue(null as never);
    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { name: "t", dueAt: "2026-01-01T00:00:00Z", groupId: "g-other" },
      }),
    );
    expect(res.status).toBe(404);
  });

  it("falls back to the calendar's default group when groupId is omitted", async () => {
    mockSession("user-1");
    prismaMock.group.findFirst.mockResolvedValue(
      makeGroup({ id: "g-default", calendarId: "c1", isDefault: true }) as never,
    );
    prismaMock.task.create.mockResolvedValue(
      makeTask({ id: "t-new", userId: "user-1", groupId: "g-default" }) as never,
    );

    const res = await POST(
      buildNextRequest({
        method: "POST",
        url: URL,
        body: { name: "T", dueAt: "2026-01-01T00:00:00Z", calendarId: "c1" },
      }),
    );

    expect(res.status).toBe(201);
    expect(prismaMock.task.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        groupId: "g-default",
        name: "T",
      }),
    });
  });
});
