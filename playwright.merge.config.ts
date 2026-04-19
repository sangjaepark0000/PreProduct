import path from "node:path";

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: path.resolve("."),
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["junit", { outputFile: "test-results/results.xml" }]
  ]
});
