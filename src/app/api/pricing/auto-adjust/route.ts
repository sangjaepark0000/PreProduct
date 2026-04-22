import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { runAutoAdjustExecution } from "@/feature/pricing/auto-adjust-execution.runner";

export async function POST(request: Request) {
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
