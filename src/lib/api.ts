import { NextResponse } from "next/server";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types";

/**
 * Return a JSON success response wrapping `data` in `{ data: T }`.
 *
 * @example return jsonSuccess(calendar, 200);
 * @example return jsonSuccess(calendar, 201);
 */
export function jsonSuccess<T>(
  data: T,
  status = 200,
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ data }, { status });
}

/**
 * Return a JSON error response with `{ error: message }`.
 *
 * @example return jsonError("Not found", 404);
 * @example return jsonError("Invalid body", 400);
 */
export function jsonError(
  message: string,
  status = 400,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message }, { status });
}
