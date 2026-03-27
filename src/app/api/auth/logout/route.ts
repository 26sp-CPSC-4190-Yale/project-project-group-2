import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/**
 * Log the user out by clearing their session.
 *
 * Invalidates the session cookie/token.
 *
 * @route   POST /api/auth/logout
 * @returns {ApiResponse<{ message: string }>} confirmation message
 * @error   401 — not authenticated (no session to clear)
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
