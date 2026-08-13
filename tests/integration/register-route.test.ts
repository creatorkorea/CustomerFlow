import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/auth/register/route";

describe("POST /api/auth/register", () => {
  it("rejects invalid register payloads before touching the database", async () => {
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        organizationName: "",
        name: "",
        email: "not-an-email",
        password: "short"
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR"
      }
    });
  });
});
