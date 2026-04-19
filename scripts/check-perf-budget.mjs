import { once } from "node:events";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import { chromium } from "@playwright/test";

import perfBudgetConfig from "../src/domain/measurement/perf-budget.config.json" with { type: "json" };

const APP_SHELL_BUDGET = perfBudgetConfig.appShell;
const PNPM_BIN = "pnpm";
const APP_HOST = "127.0.0.1";

function assertBudget(metric, actual, threshold) {
  if (actual > threshold) {
    throw new Error(
      `Perf budget failed for ${metric}: actual=${actual}, threshold=${threshold}`
    );
  }
}

async function runPnpm(args, label) {
  const child = spawn(PNPM_BIN, args, {
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  const [exitCode] = await once(child, "close");

  if (exitCode !== 0) {
    throw new Error(`${label} failed with exit code ${String(exitCode)}`);
  }
}

async function findAvailablePort() {
  const server = createServer();

  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, APP_HOST, resolve);
    });

    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Failed to determine an available port.");
    }

    return address.port;
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(undefined);
      });
    });
  }
}

async function waitForServer(url, serverProcess, timeoutMs = 120_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (serverProcess.exitCode !== null) {
      throw new Error(
        `next start exited before ${url} became ready (exit code ${String(serverProcess.exitCode)}).`
      );
    }

    try {
      const response = await fetch(url, {
        cache: "no-store"
      });

      if (response.ok) {
        return;
      }
    } catch {}

    await delay(1_000);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  const appPort = await findAvailablePort();
  const appUrl = `http://${APP_HOST}:${String(appPort)}`;
  const appOrigin = new URL(appUrl).origin;

  await runPnpm(["build"], "next build");

  const server = spawn(
    PNPM_BIN,
    ["exec", "next", "start", "--hostname", APP_HOST, "--port", String(appPort)],
    {
      env: process.env,
      stdio: "inherit",
      shell: process.platform === "win32"
    }
  );

  try {
    await waitForServer(appUrl, server);

    const browser = await chromium.launch({
      headless: true
    });

    try {
      const page = await browser.newPage();
      let totalRequests = 0;

      page.on("request", (request) => {
        try {
          if (new URL(request.url()).origin === appOrigin) {
            totalRequests += 1;
          }
        } catch {
          // Ignore browser-internal requests that do not parse as normal URLs.
        }
      });

      const response = await page.goto(appUrl, {
        waitUntil: "load"
      });

      if (!response) {
        throw new Error("Root route did not return a response.");
      }

      const html = await response.text();
      const navigationTiming = await page.evaluate(() => {
        const [entry] = performance.getEntriesByType("navigation");

        if (!(entry instanceof PerformanceNavigationTiming)) {
          throw new Error("Navigation timing entry is missing.");
        }

        return {
          responseStartMs: Math.round(entry.responseStart),
          domContentLoadedMs: Math.round(entry.domContentLoadedEventEnd),
          loadMs: Math.round(entry.loadEventEnd)
        };
      });

      const measurements = {
        ...navigationTiming,
        htmlTransferBytes: Buffer.byteLength(html, "utf8"),
        totalRequests
      };

      assertBudget(
        "responseStartMs",
        measurements.responseStartMs,
        APP_SHELL_BUDGET.responseStartMs
      );
      assertBudget(
        "domContentLoadedMs",
        measurements.domContentLoadedMs,
        APP_SHELL_BUDGET.domContentLoadedMs
      );
      assertBudget("loadMs", measurements.loadMs, APP_SHELL_BUDGET.loadMs);
      assertBudget(
        "htmlTransferBytes",
        measurements.htmlTransferBytes,
        APP_SHELL_BUDGET.htmlTransferBytes
      );
      assertBudget(
        "totalRequests",
        measurements.totalRequests,
        APP_SHELL_BUDGET.totalRequests
      );

      console.log("Perf budget passed:", measurements);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
