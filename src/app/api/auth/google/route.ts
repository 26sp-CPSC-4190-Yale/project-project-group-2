import { NextRequest, NextResponse } from "next/server";

/**
 * Redirect user to Google OAuth consent screen.
 *
 * @route   GET /api/auth/google
 * @returns 302 redirect to Google OAuth consent page
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
