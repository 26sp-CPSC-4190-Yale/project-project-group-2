import { vi } from "vitest";

/**
 * Mock Supabase storage client used in route handlers that touch
 * `@/lib/supabaseAdmin`. Tests override specific method return values as needed.
 */
export const supabaseStorageFrom = {
  upload: vi.fn(),
  remove: vi.fn(),
  createSignedUrl: vi.fn(),
};

export const supabaseAdminMock = {
  storage: {
    from: vi.fn(() => supabaseStorageFrom),
  },
};

export function resetSupabaseMock() {
  supabaseStorageFrom.upload.mockReset();
  supabaseStorageFrom.remove.mockReset();
  supabaseStorageFrom.createSignedUrl.mockReset();
  supabaseAdminMock.storage.from.mockReset();
  supabaseAdminMock.storage.from.mockImplementation(() => supabaseStorageFrom);
}
