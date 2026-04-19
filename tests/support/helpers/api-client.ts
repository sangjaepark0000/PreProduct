import type { APIRequestContext, APIResponse } from "@playwright/test";

export type ApiMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type ApiRequestParams<TData = unknown> = {
  request: APIRequestContext;
  method: ApiMethod;
  path: string;
  data?: TData;
  headers?: Record<string, string>;
  failOnStatusCode?: boolean;
};

export type ApiRequestResult<TResponse> = {
  response: APIResponse;
  body: TResponse | null;
};

export async function apiRequest<TResponse, TData = unknown>({
  request,
  method,
  path,
  data,
  headers,
  failOnStatusCode = false
}: ApiRequestParams<TData>): Promise<ApiRequestResult<TResponse>> {
  const response = await request.fetch(path, {
    method,
    data,
    headers: {
      "content-type": "application/json",
      ...headers
    },
    failOnStatusCode
  });

  let body: TResponse | null = null;
  const contentType = response.headers()["content-type"] ?? "";
  if (contentType.includes("application/json")) {
    body = (await response.json()) as TResponse;
  }

  return { response, body };
}
