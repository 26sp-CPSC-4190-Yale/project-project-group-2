import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth";
import { jsonError } from "@/lib/api";

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
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return jsonError("Missing authorization code", 400);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return jsonError("Failed to exchange authorization code", 500);
  }

  const tokenData = await tokenRes.json();

  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
  );

  if (!profileRes.ok) {
    return jsonError("Failed to fetch Google profile", 500);
  }

  const profile = await profileRes.json();

  const user = await prisma.user.upsert({
    where: { email: profile.email },
    update: {
      googleId: profile.id,
      name: profile.name,
      avatarUrl: profile.picture,
    },
    create: {
      googleId: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    },
  });

  const token = await createSessionToken(user.id);
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return response;
}
