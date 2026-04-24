import { afterAll, afterEach, beforeAll, vi } from "vitest";

const isBrowserEnv = typeof document !== "undefined";
if (isBrowserEnv) {
  await import("@testing-library/jest-dom/vitest");
}

vi.mock("@/lib/prisma", async () => {
  const { prismaMock } = await import("./helpers/prisma");
  return { prisma: prismaMock };
});

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  const { getSessionMock } = await import("./helpers/session");
  return {
    ...actual,
    getSession: getSessionMock,
  };
});

vi.mock("@/lib/supabaseAdmin", async () => {
  const { supabaseAdminMock } = await import("./helpers/supabase");
  return { supabaseAdmin: supabaseAdminMock };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => undefined),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

const { server } = await import("./msw/server");
const { resetPrismaMock } = await import("./helpers/prisma");
const { resetSessionMock } = await import("./helpers/session");
const { resetSupabaseMock } = await import("./helpers/supabase");

beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });
});

afterEach(async () => {
  if (isBrowserEnv) {
    const { cleanup } = await import("@testing-library/react");
    cleanup();
  }
  server.resetHandlers();
  resetPrismaMock();
  resetSessionMock();
  resetSupabaseMock();
});

afterAll(() => {
  server.close();
});
