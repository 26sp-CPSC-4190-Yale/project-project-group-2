import { vi } from "vitest";

/**
 * Reference to the `getSession` mock declared in tests/setup.ts.
 * Re-import from here in each test to set per-test behavior.
 */
export const getSessionMock = vi.fn<() => Promise<{ userId: string } | null>>();

/** Force `getSession()` to behave as if the given user is logged in. */
export function mockSession(userId: string | null) {
  if (userId === null) {
    getSessionMock.mockResolvedValue(null);
  } else {
    getSessionMock.mockResolvedValue({ userId });
  }
}

export function resetSessionMock() {
  getSessionMock.mockReset();
  getSessionMock.mockResolvedValue(null);
}
