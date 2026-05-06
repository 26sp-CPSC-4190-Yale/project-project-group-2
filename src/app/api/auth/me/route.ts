import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";

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
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      googleId: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) return jsonError("User not found", 404);

  return jsonSuccess(user);
}
