import { test as base } from "@playwright/test";

import {
  apiRequest,
  type ApiRequestParams,
  type ApiRequestResult
} from "../helpers/api-client.js";
import {
  mockJsonRoute as registerMockJsonRoute,
  mountTestDocument,
  type MockJsonRoute
} from "../helpers/network.js";
import {
  createListingDraft,
  type ListingDraft
} from "../factories/listing.factory.js";

type FactoryFixture = {
  createListingDraft: (overrides?: Partial<ListingDraft>) => ListingDraft;
};

type ApiFixture = {
  apiRequest: <TResponse, TData = unknown>(
    params: Omit<ApiRequestParams<TData>, "request">
  ) => Promise<ApiRequestResult<TResponse>>;
};

type BrowserFixture = {
  mockJsonRoute: (route: MockJsonRoute) => Promise<void>;
  mountTestDocument: (html: string) => Promise<void>;
};

export const test = base.extend<FactoryFixture & ApiFixture & BrowserFixture>({
  createListingDraft: async ({}, use) => {
    await use((overrides = {}) => createListingDraft(overrides));
  },
  apiRequest: async ({ request }, use) => {
    await use((params) => apiRequest({ request, ...params }));
  },
  mockJsonRoute: async ({ page }, use) => {
    await use((route) => registerMockJsonRoute(page, route));
  },
  mountTestDocument: async ({ page }, use) => {
    await use((html) => mountTestDocument(page, html));
  }
});
