// @vitest-environment node
import { describe, expect, it, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { GET } from "@/app/api/auth/google/callback/route";
import { prismaMock } from "../../../../../helpers/prisma";
import { buildNextRequest } from "../../../../../helpers/request";
import { makeUser, makeCalendar, makeGroup } from "../../../../../helpers/factories";
import { server } from "../../../../../msw/server";

const CALLBACK_URL = "http://localhost:4000/api/auth/google/callback";

describe("GET /api/auth/google/callback", () => {
  beforeEach(() => {
    server.use(
      http.post("https://oauth2.googleapis.com/token", () =>
        HttpResponse.json({ access_token: "fake-access-token" }),
      ),
      http.get("https://www.googleapis.com/oauth2/v2/userinfo", () =>
        HttpResponse.json({
          id: "google-user-1",
          email: "new@example.com",
          name: "New User",
          picture: "https://example.com/pic.jpg",
        }),
      ),
    );
  });

  it("returns 400 when the code query param is missing", async () => {
    const res = await GET(buildNextRequest({ url: CALLBACK_URL }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing authorization code" });
  });

  it("returns 500 when Google's token endpoint fails", async () => {
    server.use(
      http.post("https://oauth2.googleapis.com/token", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );
    const res = await GET(buildNextRequest({ url: `${CALLBACK_URL}?code=abc` }));
    expect(res.status).toBe(500);
  });

  it("returns 500 when Google's profile endpoint fails", async () => {
    server.use(
      http.get("https://www.googleapis.com/oauth2/v2/userinfo", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );
    const res = await GET(buildNextRequest({ url: `${CALLBACK_URL}?code=abc` }));
    expect(res.status).toBe(500);
  });

  it("upserts the user, creates a default calendar + group for new users, and sets a session cookie", async () => {
    const user = makeUser({ id: "new-user-1", email: "new@example.com", name: "New User" });
    prismaMock.user.upsert.mockResolvedValue(user as never);
    prismaMock.calendar.count.mockResolvedValue(0);
    prismaMock.calendar.create.mockResolvedValue(makeCalendar({ id: "cal-new", userId: user.id }) as never);
    prismaMock.group.create.mockResolvedValue(makeGroup({ calendarId: "cal-new" }) as never);

    const res = await GET(buildNextRequest({ url: `${CALLBACK_URL}?code=abc` }));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:4000/");

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toMatch(/^session=/);

    expect(prismaMock.user.upsert).toHaveBeenCalledWith({
      where: { email: "new@example.com" },
      update: { googleId: "google-user-1", name: "New User", avatarUrl: "https://example.com/pic.jpg" },
      create: {
        googleId: "google-user-1",
        email: "new@example.com",
        name: "New User",
        avatarUrl: "https://example.com/pic.jpg",
      },
    });
    expect(prismaMock.calendar.create).toHaveBeenCalled();
    expect(prismaMock.group.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isDefault: true }) }),
    );
  });

  it("does NOT create a default calendar when the user already has one", async () => {
    const user = makeUser({ email: "returning@example.com" });
    prismaMock.user.upsert.mockResolvedValue(user as never);
    prismaMock.calendar.count.mockResolvedValue(1);

    const res = await GET(buildNextRequest({ url: `${CALLBACK_URL}?code=abc` }));

    expect(res.status).toBe(307);
    expect(prismaMock.calendar.create).not.toHaveBeenCalled();
    expect(prismaMock.group.create).not.toHaveBeenCalled();
  });
});
