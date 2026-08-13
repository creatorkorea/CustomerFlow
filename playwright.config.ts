import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const databaseUrl =
  process.env["DATABASE_URL"] ??
  "postgresql://customerflow:customerflow@localhost:5432/customerflow?schema=public";
const authSecret =
  process.env["AUTH_SECRET"] ?? "test-secret-test-secret-test-secret-test-secret";
const authUrl = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env["CI"],
    env: {
      DATABASE_URL: databaseUrl,
      AUTH_SECRET: authSecret,
      AUTH_URL: authUrl,
      NEXTAUTH_URL: authUrl
    }
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
