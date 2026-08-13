import { describe, expect, it } from "vitest";

import {
  loginFormSchema,
  registerFormSchema
} from "@/server/auth/validation";

describe("auth validation", () => {
  it("normalizes login email before credentials sign-in", () => {
    const parsed = loginFormSchema.parse({
      email: " OWNER@EXAMPLE.COM ",
      password: "strong-password"
    });

    expect(parsed.email).toBe("owner@example.com");
  });

  it("allows an empty business number to become null on register", () => {
    const parsed = registerFormSchema.parse({
      organizationName: "홍길동 정비소",
      businessNumber: "",
      name: "홍길동",
      email: "owner@example.com",
      password: "strong-password"
    });

    expect(parsed.businessNumber).toBeNull();
  });
});
