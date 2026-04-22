import "dotenv/config";
import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

const isCi = Boolean(process.env.CI);
const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const webServerCommand = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND;
const defaultDatabaseUrl =
  "postgresql://postgres:postgres@127.0.0.1:5432/preproduct?schema=public";
const databaseUrl = process.env.DATABASE_URL ?? defaultDatabaseUrl;

process.env.DATABASE_URL = databaseUrl;

function buildWebServerEnv(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    )
  );
}

export default defineConfig({
  testDir: path.resolve("."),
  testMatch: [
    "tests/**/*.spec.ts",
    "_bmad-output/test-artifacts/red-phase/**/*.spec.ts"
  ],
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 2 : undefined,
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["junit", { outputFile: "test-results/results.xml" }]
  ],
  use: {
    baseURL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: "retain-on-failure-and-retries",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ],
  webServer: webServerCommand
    ? {
        command: webServerCommand,
        env: buildWebServerEnv(),
        url: baseURL,
        reuseExistingServer: !isCi,
        timeout: 120_000
      }
    : undefined
});
