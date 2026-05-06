// @vitest-environment node
import { describe, expect, it } from "vitest";
import { PATCH, DELETE } from "@/app/api/files/[id]/route";
import { prismaMock } from "../../../../helpers/prisma";
import { mockSession } from "../../../../helpers/session";
import { buildNextRequest, buildIdContext } from "../../../../helpers/request";
import { supabaseStorageFrom } from "../../../../helpers/supabase";
import { makeUploadedFile, makeCalendar } from "../../../../helpers/factories";

const url = (id: string) => `http://localhost:4000/api/files/${id}`;

describe("PATCH /api/files/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("f1"), body: { name: "x" } }),
      buildIdContext("f1"),
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when the file does not belong to the user", async () => {
    mockSession("user-1");
    prismaMock.uploadedFile.findFirst.mockResolvedValue(null as never);
    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("f1"), body: { name: "x" } }),
      buildIdContext("f1"),
    );
    expect(res.status).toBe(404);
  });

  it("renames the file on happy path", async () => {
    mockSession("user-1");
    prismaMock.uploadedFile.findFirst.mockResolvedValue(
      makeUploadedFile({ id: "f1", userId: "user-1", name: "old.pdf" }) as never,
    );
    prismaMock.uploadedFile.update.mockResolvedValue(
      { ...makeUploadedFile({ id: "f1", userId: "user-1", name: "new.pdf" }), calendar: null } as never,
    );

    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("f1"), body: { name: "new.pdf" } }),
      buildIdContext("f1"),
    );

    expect(res.status).toBe(200);
    expect((await res.json()).data.name).toBe("new.pdf");
    expect(prismaMock.uploadedFile.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "f1" }, data: { name: "new.pdf" } }),
    );
  });

  it("can reassign the file to a different calendar owned by the caller", async () => {
    mockSession("user-1");
    prismaMock.uploadedFile.findFirst.mockResolvedValue(
      makeUploadedFile({ id: "f1", userId: "user-1" }) as never,
    );
    prismaMock.calendar.findFirst.mockResolvedValue(
      makeCalendar({ id: "c2", userId: "user-1" }) as never,
    );
    prismaMock.uploadedFile.update.mockResolvedValue(
      { ...makeUploadedFile({ id: "f1", calendarId: "c2" }), calendar: null } as never,
    );

    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("f1"), body: { calendarId: "c2" } }),
      buildIdContext("f1"),
    );

    expect(res.status).toBe(200);
    expect(prismaMock.calendar.findFirst).toHaveBeenCalledWith({
      where: { id: "c2", userId: "user-1" },
      select: { id: true },
    });
    expect(prismaMock.uploadedFile.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { calendarId: "c2" } }),
    );
  });

  it("returns 400 when calendarId belongs to another user", async () => {
    mockSession("user-1");
    prismaMock.uploadedFile.findFirst.mockResolvedValue(
      makeUploadedFile({ id: "f1", userId: "user-1" }) as never,
    );
    prismaMock.calendar.findFirst.mockResolvedValue(null as never);

    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("f1"), body: { calendarId: "c-foreign" } }),
      buildIdContext("f1"),
    );

    expect(res.status).toBe(400);
    expect(prismaMock.uploadedFile.update).not.toHaveBeenCalled();
  });

  it("allows clearing the calendar association with explicit null", async () => {
    mockSession("user-1");
    prismaMock.uploadedFile.findFirst.mockResolvedValue(
      makeUploadedFile({ id: "f1", userId: "user-1", calendarId: "c1" }) as never,
    );
    prismaMock.uploadedFile.update.mockResolvedValue(
      { ...makeUploadedFile({ id: "f1", calendarId: null }), calendar: null } as never,
    );

    const res = await PATCH(
      buildNextRequest({ method: "PATCH", url: url("f1"), body: { calendarId: null } }),
      buildIdContext("f1"),
    );

    expect(res.status).toBe(200);
    expect(prismaMock.calendar.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.uploadedFile.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { calendarId: null } }),
    );
  });
});

describe("DELETE /api/files/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await DELETE(
      buildNextRequest({ method: "DELETE", url: url("f1") }),
      buildIdContext("f1"),
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when the file does not belong to the user", async () => {
    mockSession("user-1");
    prismaMock.uploadedFile.findFirst.mockResolvedValue(null as never);
    const res = await DELETE(
      buildNextRequest({ method: "DELETE", url: url("f1") }),
      buildIdContext("f1"),
    );
    expect(res.status).toBe(404);
  });

  it("removes the Supabase object and the db row on happy path", async () => {
    mockSession("user-1");
    prismaMock.uploadedFile.findFirst.mockResolvedValue(
      makeUploadedFile({
        id: "f1",
        userId: "user-1",
        storagePath: "user-1/doc.pdf",
      }) as never,
    );
    supabaseStorageFrom.remove.mockResolvedValue({ data: null, error: null });
    prismaMock.uploadedFile.delete.mockResolvedValue(makeUploadedFile({ id: "f1" }) as never);

    const res = await DELETE(
      buildNextRequest({ method: "DELETE", url: url("f1") }),
      buildIdContext("f1"),
    );

    expect(res.status).toBe(200);
    expect((await res.json()).data.message).toBe("File deleted");
    expect(supabaseStorageFrom.remove).toHaveBeenCalledWith(["user-1/doc.pdf"]);
    expect(prismaMock.uploadedFile.delete).toHaveBeenCalledWith({ where: { id: "f1" } });
  });
});
