import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "DUPLICATE_RESOURCE"
  | "BUSINESS_RULE_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

type Serializable =
  | string
  | number
  | boolean
  | null
  | Serializable[]
  | { [key: string]: Serializable };

function toSerializable(value: unknown): Serializable {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toSerializable);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, toSerializable(item)])
    );
  }

  return value as Serializable;
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data: toSerializable(data)
    },
    { status }
  );
}

export function failure(
  code: ApiErrorCode,
  message: string,
  status = 400
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message
      }
    },
    { status }
  );
}
