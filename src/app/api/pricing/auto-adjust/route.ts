import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { runAutoAdjustExecution } from "@/feature/pricing/auto-adjust-execution.runner";

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

function authorizeSchedulerRequest(request: Request): NextResponse | null {
  const expectedToken = process.env.AUTO_ADJUST_SCHEDULER_TOKEN?.trim();

  if (!expectedToken) {
    return NextResponse.json(
      {
        error: {
          code: "SCHEDULER_AUTH_NOT_CONFIGURED",
          message: "Auto-adjust scheduler token is not configured."
        }
      },
      { status: 503 }
    );
  }

  if (getBearerToken(request) !== expectedToken) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Auto-adjust scheduler authorization failed."
        }
      },
      { status: 401 }
    );
  }

  return null;
}

export async function POST(request: Request) {
  const authorizationFailure = authorizeSchedulerRequest(request);

  if (authorizationFailure) {
    return authorizationFailure;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "Auto-adjust execution request body must be valid JSON."
        }
      },
      { status: 400 }
    );
  }

  try {
    const result = await runAutoAdjustExecution(body);

    return NextResponse.json(result, {
      status: result.status === "duplicate" ? 200 : 202
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "Auto-adjust execution request is invalid.",
            details: error.issues
          }
        },
        { status: 400 }
      );
    }

    throw error;
  }
}
