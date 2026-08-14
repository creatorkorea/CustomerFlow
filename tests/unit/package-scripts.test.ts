import { describe, expect, it } from "vitest";

import packageJson from "../../package.json";

describe("package scripts", () => {
  it("generates the Prisma client after dependency installation for fresh deploys", () => {
    expect(packageJson.scripts).toMatchObject({
      postinstall: "prisma generate"
    });
  });
});
