// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET, PATCH, DELETE } from "@/app/api/calendars/[id]/route";
import { prismaMock } from "../../../../helpers/prisma";
import { mockSession } from "../../../../helpers/session";
import { buildNextRequest, buildIdContext } from "../../../../helpers/request";
import { makeCalendar } from "../../../../helpers/factories";

const url = (id: string) => `http://localhost:4000/api/calendars/${id}`;

describe("GET /api/calendars/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await GET(buildNextRequest({ url: url("c1") }), buildIdContext("c1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when the calendar does not exist", async () => {
    mockSession("user-1");
    prismaMock.calendar.findUnique.mockResolvedValue(null as never);
    const res = await GET(buildNextRequest({ url: url("c1") }), buildIdContext("c1"));
    expect(res.status).toBe(404);
  });

  it("returns 403 when the calendar belongs to another user", async () => {
    mockSession("user-1");
    prismaMock.calendar.findUnique.mockResolvedValue(
      makeCalendar({ id: "c1", userId: "user-2" }) as never,
    );
    const res = await GET(buildNextRequest({ url: url("c1") }), buildIdContext("c1"));
    expect(res.status).toBe(403);
  });

  it("returns the calendar on happy path", async () => {
    mockSession("user-1");
    const cal = makeCalendar({ id: "c1", userId: "user-1", title: "Mine" });
    prismaMock.calendar.findUnique.mockResolvedValue(cal as never);

    const res = await GET(buildNextRequest({ url: url("c1") }), buildIdContext("c1"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe("c1");
    expect(body.data.title).toBe("Mine");
  });
});

describe("PATCH /api/calendars/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("c1"), body: { title: "x" } }),
      buildIdContext("c1"),
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when the calendar does not exist", async () => {
    mockSession("user-1");
    prismaMock.calendar.findUnique.mockResolvedValue(null as never);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("c1"), body: { title: "x" } }),
      buildIdContext("c1"),
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when the calendar belongs to another user", async () => {
    mockSession("user-1");
    prismaMock.calendar.findUnique.mockResolvedValue(
      makeCalendar({ id: "c1", userId: "user-2" }) as never,
    );
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("c1"), body: { title: "x" } }),
      buildIdContext("c1"),
    );
    expect(res.status).toBe(403);
  });

  it("updates the calendar on happy path", async () => {
    mockSession("user-1");
    const existing = makeCalendar({ id: "c1", userId: "user-1", title: "Old" });
    const updated = makeCalendar({ id: "c1", userId: "user-1", title: "New" });
    prismaMock.calendar.findUnique.mockResolvedValue(existing as never);
    prismaMock.calendar.update.mockResolvedValue(updated as never);

    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("c1"), body: { title: "New" } }),
      buildIdContext("c1"),
    );

    expect(res.status).toBe(200);
    expect((await res.json()).data.title).toBe("New");
    expect(prismaMock.calendar.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { title: "New", color: undefined, description: undefined },
    });
  });
});

describe("DELETE /api/calendars/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("c1") }), buildIdContext("c1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when the calendar does not exist", async () => {
    mockSession("user-1");
    prismaMock.calendar.findUnique.mockResolvedValue(null as never);
    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("c1") }), buildIdContext("c1"));
    expect(res.status).toBe(404);
  });

  it("returns 403 when the calendar belongs to another user", async () => {
    mockSession("user-1");
    prismaMock.calendar.findUnique.mockResolvedValue(
      makeCalendar({ id: "c1", userId: "user-2" }) as never,
    );
    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("c1") }), buildIdContext("c1"));
    expect(res.status).toBe(403);
  });

  it("deletes the calendar on happy path", async () => {
    mockSession("user-1");
    prismaMock.calendar.findUnique.mockResolvedValue(
      makeCalendar({ id: "c1", userId: "user-1" }) as never,
    );
    prismaMock.calendar.delete.mockResolvedValue(makeCalendar({ id: "c1" }) as never);

    const res = await DELETE(buildNextRequest({ method: "DELETE", url: url("c1") }), buildIdContext("c1"));

    expect(res.status).toBe(200);
    expect((await res.json()).data.message).toBe("Calendar deleted");
    expect(prismaMock.calendar.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
  });
});
