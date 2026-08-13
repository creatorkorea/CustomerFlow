import type { ApiErrorCode } from "./api-response";

export class AppError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status = 400
  ) {
    super(message);
  }
}

export function toApiError(error: unknown) {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status
    };
  }

  return {
    code: "INTERNAL_ERROR" as const,
    message: "요청을 처리하는 중 오류가 발생했습니다.",
    status: 500
  };
}
