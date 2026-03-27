import { NextRequest, NextResponse } from "next/server";

/**
 * Handle the Google OAuth callback.
 *
 * Google redirects here with an authorization `code` query parameter.
 * This handler exchanges the code for tokens, fetches the user's Google
 * profile (id, email, name, picture), upserts the User record in the
 * database, creates a session (cookie/token), and redirects the user
 * to the app's main page.
 *
 * @route   GET /api/auth/google/callback
 * @query   code  — authorization code from Google
 * @query   state — CSRF state token (if used)
 * @returns 302 redirect to app home on success, or error response
 * @error   400 — missing or invalid authorization code
 * @error   500 — token exchange or profile fetch failed
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
