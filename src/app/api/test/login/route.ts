import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api";

/**
 * Test-only login endpoint. Lets Playwright specs bypass Google OAuth by
 * upserting a dev user and returning a real session cookie.
 *
 * Returns 404 in production so the route cannot be used to forge sessions.
 *
 * @route   POST /api/test/login
 * @body    { email: string; name?: string }
 * @returns {ApiResponse<{ id: string }>} the user's database id
 * @error   404 — when NODE_ENV === "production"
 * @error   400 — missing email
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return jsonError("Not found", 404);
  }

  let body: { email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (!body.email) return jsonError("email is required", 400);

  const user = await prisma.user.upsert({
    where: { email: body.email },
    update: {},
    create: {
      email: body.email,
      name: body.name ?? body.email.split("@")[0],
    },
  });

  const calendarCount = await prisma.calendar.count({
    where: { userId: user.id },
  });
  if (calendarCount === 0) {
    const calendar = await prisma.calendar.create({
      data: { title: "My Calendar", userId: user.id, isDefault: true },
    });
    await prisma.group.create({
      data: {
        calendarId: calendar.id,
        name: "Default Group",
        isDefault: true,
      },
    });
  }

  const token = await createSessionToken(user.id);
  const response = jsonSuccess({ id: user.id });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
  return response;
}
