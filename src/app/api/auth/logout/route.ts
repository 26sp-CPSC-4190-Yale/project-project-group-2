import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { jsonSuccess } from "@/lib/api";

/**
 * Log the user out by clearing their session.
 *
 * Invalidates the session cookie/token.
 *
 * @route   POST /api/auth/logout
 * @returns {ApiResponse<{ message: string }>} confirmation message
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = jsonSuccess({ message: "Logged out" });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
