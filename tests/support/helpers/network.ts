import type { Page } from "@playwright/test";

import type { ApiMethod } from "./api-client.js";

export type MockJsonRoute = {
  url: RegExp | string;
  method?: ApiMethod;
  status?: number;
  body: unknown;
  headers?: Record<string, string>;
};

export async function mockJsonRoute(
  page: Page,
  { url, method, status = 200, body, headers }: MockJsonRoute
): Promise<void> {
  await page.route(url, async (route) => {
    if (method && route.request().method() !== method) {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status,
      contentType: "application/json",
      headers,
      body: JSON.stringify(body)
    });
  });
}

export async function mountTestDocument(
  page: Page,
  html: string
): Promise<void> {
  await page.setContent(html, { waitUntil: "domcontentloaded" });
}
