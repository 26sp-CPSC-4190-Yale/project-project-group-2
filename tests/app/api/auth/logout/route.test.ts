// @vitest-environment node
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/auth/logout/route";
import { buildNextRequest } from "../../../../helpers/request";

describe("POST /api/auth/logout", () => {
  it("returns 200 and clears the session cookie", async () => {
    const res = await POST(
      buildNextRequest({ method: "POST", url: "http://localhost:4000/api/auth/logout" }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { message: "Logged out" } });

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("session=");
    // A deleted cookie is set with Max-Age=0 or an expired date
    expect(setCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
  });
});
