// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/files/[id]/open/route";
import { prismaMock } from "../../../../../helpers/prisma";
import { mockSession } from "../../../../../helpers/session";
import { buildNextRequest, buildIdContext } from "../../../../../helpers/request";
import { supabaseStorageFrom } from "../../../../../helpers/supabase";
import { makeUploadedFile } from "../../../../../helpers/factories";

const url = (id: string) => `http://localhost:4000/api/files/${id}/open`;

describe("GET /api/files/[id]/open", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const res = await GET(buildNextRequest({ url: url("f1") }), buildIdContext("f1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when the file does not belong to the user", async () => {
    mockSession("user-1");
    prismaMock.uploadedFile.findFirst.mockResolvedValue(null as never);
    const res = await GET(buildNextRequest({ url: url("f1") }), buildIdContext("f1"));
    expect(res.status).toBe(404);
  });

  it("returns 500 when Supabase fails to generate a signed URL", async () => {
    mockSession("user-1");
    prismaMock.uploadedFile.findFirst.mockResolvedValue(
      makeUploadedFile({ id: "f1", userId: "user-1" }) as never,
    );
    supabaseStorageFrom.createSignedUrl.mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });
    const res = await GET(buildNextRequest({ url: url("f1") }), buildIdContext("f1"));
    expect(res.status).toBe(500);
  });

  it("returns the signed URL on happy path", async () => {
    mockSession("user-1");
    prismaMock.uploadedFile.findFirst.mockResolvedValue(
      makeUploadedFile({
        id: "f1",
        userId: "user-1",
        storagePath: "user-1/doc.pdf",
      }) as never,
    );
    supabaseStorageFrom.createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://supabase.example/abc.pdf?sig=xyz" },
      error: null,
    });

    const res = await GET(buildNextRequest({ url: url("f1") }), buildIdContext("f1"));

    expect(res.status).toBe(200);
    expect((await res.json()).data.url).toBe("https://supabase.example/abc.pdf?sig=xyz");
    expect(supabaseStorageFrom.createSignedUrl).toHaveBeenCalledWith("user-1/doc.pdf", 60);
  });
});
