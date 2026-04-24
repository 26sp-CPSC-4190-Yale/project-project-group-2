// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  sessionCookieOptions,
} from "@/lib/auth";

describe("@/lib/auth", () => {
  describe("createSessionToken + verifySessionToken", () => {
    it("round-trips a user id", async () => {
      const token = await createSessionToken("user-123");
      const payload = await verifySessionToken(token);
      expect(payload).toEqual({ userId: "user-123" });
    });

    it("returns null for a tampered token", async () => {
      const token = await createSessionToken("user-123");
      const tampered = token.slice(0, -4) + "XXXX";
      expect(await verifySessionToken(tampered)).toBeNull();
    });

    it("returns null for garbage input", async () => {
      expect(await verifySessionToken("not-a-jwt")).toBeNull();
      expect(await verifySessionToken("")).toBeNull();
    });

    it("returns null when the secret used to sign differs from the verifier", async () => {
      const token = await createSessionToken("user-123");
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "a-completely-different-secret";
      try {
        expect(await verifySessionToken(token)).toBeNull();
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });

    it("throws a helpful error when JWT_SECRET is missing", async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      try {
        await expect(createSessionToken("user-123")).rejects.toThrow(
          /JWT_SECRET/,
        );
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });
  });

  describe("constants + cookie options", () => {
    it("uses a stable cookie name", () => {
      expect(SESSION_COOKIE_NAME).toBe("session");
    });

    it("session lasts 7 days", () => {
      expect(SESSION_MAX_AGE).toBe(60 * 60 * 24 * 7);
    });

    it("session cookie is httpOnly, lax, path=/", () => {
      expect(sessionCookieOptions.httpOnly).toBe(true);
      expect(sessionCookieOptions.sameSite).toBe("lax");
      expect(sessionCookieOptions.path).toBe("/");
      expect(sessionCookieOptions.maxAge).toBe(SESSION_MAX_AGE);
    });
  });
});
