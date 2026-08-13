import { describe, expect, it } from "vitest";

import { getEnv, getEnvIssueMessages } from "@/lib/env";

describe("env validation", () => {
  it("accepts the required CustomerFlow environment values", () => {
    const env = getEnv({
      DATABASE_URL:
        "postgresql://customerflow:customerflow@localhost:5432/customerflow?schema=public",
      AUTH_SECRET: "a".repeat(32),
      NEXTAUTH_URL: "http://localhost:3000"
    } as unknown as NodeJS.ProcessEnv);

    expect(env.DATABASE_URL).toContain("postgresql://");
  });

  it("reports all missing or invalid values", () => {
    const issues = getEnvIssueMessages({
      DATABASE_URL: "mysql://localhost/customerflow",
      AUTH_SECRET: "short",
      NEXTAUTH_URL: "not-a-url"
    } as unknown as NodeJS.ProcessEnv);

    expect(issues.map((issue) => issue.path)).toEqual([
      "DATABASE_URL",
      "AUTH_SECRET",
      "NEXTAUTH_URL"
    ]);
  });
});
