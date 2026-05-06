// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/files/route";
import { prismaMock } from "../../../helpers/prisma";
import { mockSession } from "../../../helpers/session";
import { makeUploadedFile } from "../../../helpers/factories";

describe("GET /api/files", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns all files owned by the caller, newest first", async () => {
    mockSession("user-1");
    const files = [makeUploadedFile({ id: "f1", userId: "user-1" })];
    prismaMock.uploadedFile.findMany.mockResolvedValue(files as never);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("f1");
    expect(prismaMock.uploadedFile.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
      include: { calendar: { select: { id: true, title: true } } },
    });
  });
});
