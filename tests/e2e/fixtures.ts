import { test as base, expect, type Page, type Route } from "@playwright/test";

/**
 * Playwright fixtures for this project.
 *
 * `authedPage` uses the test-only `/api/test/login` endpoint to obtain a real
 * session cookie against the running `next dev` server. Because this
 * endpoint upserts a `User` row via Prisma, the running dev server must be
 * able to reach a real database (the Supabase Postgres in `.env`).
 *
 * `mockApi(page, routes)` registers `page.route()` handlers for `/api/**`
 * calls that client components issue after hydration. SSR'd server
 * components still hit the real backend — that is the inherent limit of
 * browser-level network mocking.
 */

type Fixtures = {
  authedPage: Page;
  mockApi: (
    page: Page,
    routes: Record<string, (route: Route) => Promise<void> | void>,
  ) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  authedPage: async ({ page }, use) => {
    const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.dev`;
    const res = await page.request.post("/api/test/login", {
      data: { email, name: "E2E User" },
    });
    if (!res.ok()) {
      throw new Error(
        `Failed to login via /api/test/login (status ${res.status()}). ` +
          `Make sure NODE_ENV !== 'production' and the dev DB is reachable.`,
      );
    }
    await use(page);
  },
  mockApi: async ({}, use) => {
    use(async (page, routes) => {
      for (const [pattern, handler] of Object.entries(routes)) {
        await page.route(pattern, handler);
      }
    });
  },
});

export { expect };

/**
 * Tiny helper for wrapping a JSON response in the project's
 * `{ data: ... }` envelope used by most handlers.
 */
export function jsonData(data: unknown, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify({ data }),
  };
}

/**
 * Raw JSON (no envelope), used by `/api/files` which returns an array directly.
 */
export function jsonRaw(data: unknown, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify(data),
  };
}
