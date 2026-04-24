// @vitest-environment node
import { describe, expect, it } from "vitest";
import { jsonError, jsonSuccess } from "@/lib/api";

describe("@/lib/api", () => {
  describe("jsonSuccess", () => {
    it("wraps data in { data } with status 200 by default", async () => {
      const res = jsonSuccess({ hello: "world" });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ data: { hello: "world" } });
    });

    it("respects a custom status", async () => {
      const res = jsonSuccess({ id: "abc" }, 201);
      expect(res.status).toBe(201);
      expect(await res.json()).toEqual({ data: { id: "abc" } });
    });

    it("sets the JSON content type", () => {
      const res = jsonSuccess({});
      expect(res.headers.get("content-type")).toContain("application/json");
    });
  });

  describe("jsonError", () => {
    it("wraps the message in { error } with status 400 by default", async () => {
      const res = jsonError("bad input");
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "bad input" });
    });

    it("respects a custom status", async () => {
      const res = jsonError("nope", 401);
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "nope" });
    });
  });
});
