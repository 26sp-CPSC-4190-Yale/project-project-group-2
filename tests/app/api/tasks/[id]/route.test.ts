// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET, PATCH, DELETE } from "@/app/api/tasks/[id]/route";
import { prismaMock } from "../../../../helpers/prisma";
import { mockSession } from "../../../../helpers/session";
import { buildNextRequest, buildIdContext } from "../../../../helpers/request";
import { makeGroup, makeTask } from "../../../../helpers/factories";

const url = (id: string) => `http://localhost:4000/api/tasks/${id}`;

describe("GET /api/tasks/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await GET(buildNextRequest({ url: url("t1") }), buildIdContext("t1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when the task does not belong to the user", async () => {
    mockSession("user-1");
    prismaMock.task.findFirst.mockResolvedValue(null as never);
    const res = await GET(buildNextRequest({ url: url("t1") }), buildIdContext("t1"));
    expect(res.status).toBe(404);
  });

  it("returns the task on happy path", async () => {
    mockSession("user-1");
    prismaMock.task.findFirst.mockResolvedValue(makeTask({ id: "t1", name: "Do" }) as never);
    const res = await GET(buildNextRequest({ url: url("t1") }), buildIdContext("t1"));
    expect(res.status).toBe(200);
    expect((await res.json()).data.name).toBe("Do");
  });
});

describe("PATCH /api/tasks/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("t1"), body: { completed: true } }),
      buildIdContext("t1"),
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when the task does not belong to the user", async () => {
    mockSession("user-1");
    prismaMock.task.findFirst.mockResolvedValue(null as never);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("t1"), body: { completed: true } }),
      buildIdContext("t1"),
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 when the target groupId is not owned by the user", async () => {
    mockSession("user-1");
    prismaMock.task.findFirst.mockResolvedValue(makeTask({ id: "t1" }) as never);
    prismaMock.group.findFirst.mockResolvedValue(null as never);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("t1"), body: { groupId: "g-other" } }),
      buildIdContext("t1"),
    );
    expect(res.status).toBe(404);
  });

  it("toggles completion on happy path", async () => {
    mockSession("user-1");
    prismaMock.task.findFirst.mockResolvedValue(makeTask({ id: "t1", completed: false }) as never);
    prismaMock.task.update.mockResolvedValue(makeTask({ id: "t1", completed: true }) as never);

    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("t1"), body: { completed: true } }),
      buildIdContext("t1"),
    );

    expect(res.status).toBe(200);
    expect((await res.json()).data.completed).toBe(true);
    expect(prismaMock.task.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: expect.objectContaining({ completed: true }),
    });
  });
});

describe("DELETE /api/tasks/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("t1") }), buildIdContext("t1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when the task does not belong to the user", async () => {
    mockSession("user-1");
    prismaMock.task.findFirst.mockResolvedValue(null as never);
    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("t1") }), buildIdContext("t1"));
    expect(res.status).toBe(404);
  });

  it("deletes the task on happy path", async () => {
    mockSession("user-1");
    prismaMock.task.findFirst.mockResolvedValue(makeTask({ id: "t1" }) as never);
    prismaMock.task.delete.mockResolvedValue(makeTask({ id: "t1" }) as never);

    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("t1") }), buildIdContext("t1"));

    expect(res.status).toBe(200);
    expect((await res.json()).data.message).toBe("Task deleted");
  });
});
