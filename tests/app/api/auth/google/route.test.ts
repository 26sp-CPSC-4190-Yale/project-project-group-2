// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/auth/google/route";
import { buildNextRequest } from "../../../../helpers/request";

describe("GET /api/auth/google", () => {
  it("redirects to Google's OAuth consent screen", async () => {
    const res = await GET(buildNextRequest({ url: "http://localhost:4000/api/auth/google" }));

    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("https://accounts.google.com/o/oauth2/v2/auth");
    expect(location).toContain("client_id=test-google-client-id");
    expect(location).toContain("redirect_uri=");
    expect(location).toContain("scope=openid+email+profile");
  });

  it("returns 500 when GOOGLE_CLIENT_ID is missing", async () => {
    const saved = process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_ID;
    try {
      const res = await GET(buildNextRequest({ url: "http://localhost:4000/api/auth/google" }));
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: "Google OAuth is not configured" });
    } finally {
      process.env.GOOGLE_CLIENT_ID = saved;
    }
  });

  it("returns 500 when GOOGLE_REDIRECT_URI is missing", async () => {
    const saved = process.env.GOOGLE_REDIRECT_URI;
    delete process.env.GOOGLE_REDIRECT_URI;
    try {
      const res = await GET(buildNextRequest({ url: "http://localhost:4000/api/auth/google" }));
      expect(res.status).toBe(500);
    } finally {
      process.env.GOOGLE_REDIRECT_URI = saved;
    }
  });
});
