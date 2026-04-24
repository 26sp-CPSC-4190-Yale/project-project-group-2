// @vitest-environment node
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/upload/route";
import { prismaMock } from "../../../helpers/prisma";
import { mockSession } from "../../../helpers/session";
import { supabaseStorageFrom } from "../../../helpers/supabase";
import { makeUploadedFile } from "../../../helpers/factories";

const URL = "http://localhost:4000/api/upload";

function makeRequestWithFile(file: File, extraFields: Record<string, string> = {}) {
  const form = new FormData();
  form.append("file", file);
  for (const [k, v] of Object.entries(extraFields)) form.append(k, v);
  return new Request(URL, { method: "POST", body: form });
}

describe("POST /api/upload", () => {
  it("returns 401 when unauthenticated", async () => {
    mockSession(null);
    const file = new File(["pdf"], "x.pdf", { type: "application/pdf" });
    const res = await POST(makeRequestWithFile(file));
    expect(res.status).toBe(401);
  });

  it("returns 400 when no file is uploaded", async () => {
    mockSession("user-1");
    const form = new FormData();
    form.append("note", "no file");
    const res = await POST(new Request(URL, { method: "POST", body: form }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when the file is not a PDF", async () => {
    mockSession("user-1");
    const file = new File(["hello"], "x.txt", { type: "text/plain" });
    const res = await POST(makeRequestWithFile(file));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/PDF/i);
  });

  it("returns 500 when Supabase upload fails", async () => {
    mockSession("user-1");
    supabaseStorageFrom.upload.mockResolvedValue({ data: null, error: { message: "boom" } });
    const file = new File(["pdf"], "x.pdf", { type: "application/pdf" });
    const res = await POST(makeRequestWithFile(file));
    expect(res.status).toBe(500);
  });

  it("uploads and persists the file on happy path", async () => {
    mockSession("user-1");
    supabaseStorageFrom.upload.mockResolvedValue({ data: { path: "x" }, error: null });
    prismaMock.uploadedFile.create.mockResolvedValue(
      { ...makeUploadedFile({ id: "f-new", userId: "user-1" }), calendar: null } as never,
    );

    const file = new File(["pdf"], "hello world.pdf", { type: "application/pdf" });
    const res = await POST(makeRequestWithFile(file, { calendarId: "c1" }));

    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe("f-new");

    expect(supabaseStorageFrom.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^user-1\/\d+_hello_world\.pdf$/),
      expect.any(Buffer),
      { contentType: "application/pdf" },
    );
    expect(prismaMock.uploadedFile.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "hello world.pdf",
        userId: "user-1",
        calendarId: "c1",
      }),
      include: { calendar: { select: { id: true, title: true } } },
    });
  });
});
