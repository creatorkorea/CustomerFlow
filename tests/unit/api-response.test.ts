import { describe, expect, it } from "vitest";

import { failure, success } from "@/server/shared/api-response";

describe("api response helpers", () => {
  it("serializes success payloads with BigInt and Date values", async () => {
    const response = success({
      id: 1n,
      createdAt: new Date("2026-08-13T00:00:00.000Z")
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        id: "1",
        createdAt: "2026-08-13T00:00:00.000Z"
      }
    });
  });

  it("returns the standard error envelope", async () => {
    const response = failure("VALIDATION_ERROR", "입력값을 확인해주세요.", 400);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "입력값을 확인해주세요."
      }
    });
  });
});
