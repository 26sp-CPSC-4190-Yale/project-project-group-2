import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, UserResponse } from "@/types";

/**
 * Return the currently authenticated user's profile.
 *
 * Reads the session cookie/token from the request, validates it, and
 * returns the corresponding User record (excluding sensitive fields
 * like password).
 *
 * @route   GET /api/auth/me
 * @returns {ApiResponse<UserResponse>} the authenticated user's profile
 * @error   401 — not authenticated or session expired
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<UserResponse>>> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
