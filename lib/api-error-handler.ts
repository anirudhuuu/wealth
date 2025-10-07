import { NextResponse } from "next/server";
import { getUserFriendlyMessage, handleError } from "./errors";

export function handleApiError(error: unknown): NextResponse {
  const appError = handleError(error);

  return NextResponse.json(
    {
      error: getUserFriendlyMessage(appError),
      code: appError.code,
    },
    { status: appError.statusCode }
  );
}

export class ApiError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = "ApiError";
  }
}
