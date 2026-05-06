import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

/**
 * Deep mock of PrismaClient used in place of the real client in all tests.
 * Every method is a `vi.fn()` by default — tests set per-test behavior via
 * `prismaMock.user.findUnique.mockResolvedValue(...)` etc.
 */
export const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

export function resetPrismaMock() {
  mockReset(prismaMock);
}
