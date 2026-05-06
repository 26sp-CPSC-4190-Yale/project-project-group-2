// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/auth/me/route";
import { prismaMock } from "../../../../helpers/prisma";
import { mockSession } from "../../../../helpers/session";
import { buildNextRequest } from "../../../../helpers/request";
import { makeUser } from "../../../../helpers/factories";

describe("GET /api/auth/me", () => {
  it("returns 401 when not authenticated", async () => {
    mockSession(null);
    const res = await GET(buildNextRequest({ url: "http://localhost:4000/api/auth/me" }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 404 when the session's user row cannot be found", async () => {
    mockSession("user-ghost");
    prismaMock.user.findUnique.mockResolvedValue(null as never);
    const res = await GET(buildNextRequest({ url: "http://localhost:4000/api/auth/me" }));
    expect(res.status).toBe(404);
  });

  it("returns the authenticated user's profile and never selects the password column", async () => {
    mockSession("user-1");
    const { password: _unused, ...safeUser } = makeUser({
      id: "user-1",
      email: "me@example.com",
      name: "Me",
    });
    prismaMock.user.findUnique.mockResolvedValue(safeUser as never);

    const res = await GET(buildNextRequest({ url: "http://localhost:4000/api/auth/me" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe("user-1");
    expect(body.data.email).toBe("me@example.com");

    const selectArg = prismaMock.user.findUnique.mock.calls[0][0].select;
    expect(selectArg).not.toHaveProperty("password");
  });
});
