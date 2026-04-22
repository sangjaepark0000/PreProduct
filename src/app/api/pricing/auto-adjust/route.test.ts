import { POST } from "@/app/api/pricing/auto-adjust/route";
import { runAutoAdjustExecution } from "@/feature/pricing/auto-adjust-execution.runner";
import { ZodError } from "zod";

jest.mock("@/feature/pricing/auto-adjust-execution.runner", () => ({
  runAutoAdjustExecution: jest.fn()
}));

const requestPayload = {
  listingId: "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af",
  runKey: "run-20260422-001",
  traceId: "trace-auto-adjust-20260422",
  requestedAt: "2026-04-22T02:00:00.000Z",
  ruleRevision: "rule-20260422-001",
  currentPriceKrw: 1_850_000
};
const schedulerToken = "test-auto-adjust-scheduler-token";

function schedulerRequest(body: unknown, token = schedulerToken): Request {
  return new Request("http://localhost/api/pricing/auto-adjust", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
}

describe("pricing auto-adjust route", () => {
  const originalSchedulerToken = process.env.AUTO_ADJUST_SCHEDULER_TOKEN;

  beforeEach(() => {
    process.env.AUTO_ADJUST_SCHEDULER_TOKEN = schedulerToken;
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (originalSchedulerToken === undefined) {
      delete process.env.AUTO_ADJUST_SCHEDULER_TOKEN;
    } else {
      process.env.AUTO_ADJUST_SCHEDULER_TOKEN = originalSchedulerToken;
    }
  });

  it("runs a due execution through the scheduler-facing route and returns the reason log", async () => {
    (runAutoAdjustExecution as jest.Mock).mockResolvedValueOnce({
      status: "applied",
      reasonCode: "due-rule-applied",
      listingId: requestPayload.listingId,
      runKey: requestPayload.runKey,
      traceId: requestPayload.traceId,
      ruleRevision: requestPayload.ruleRevision,
      beforePriceKrw: 1_850_000,
      afterPriceKrw: 1_702_000,
      appliedAt: "2026-04-22T02:00:00.000Z",
      evaluationAt: "2026-04-22T02:00:00.000Z",
      eventId: "fdd23504-9420-5d9b-8f56-9dd000f54344"
    });

    const response = await POST(schedulerRequest(requestPayload));

    expect(response.status).toBe(202);
    expect(runAutoAdjustExecution).toHaveBeenCalledWith(requestPayload);
    await expect(response.json()).resolves.toMatchObject({
      status: "applied",
      reasonCode: "due-rule-applied",
      runKey: "run-20260422-001",
      appliedAt: "2026-04-22T02:00:00.000Z",
      eventId: "fdd23504-9420-5d9b-8f56-9dd000f54344"
    });
  });

  it("returns duplicate replay results without treating them as route failures", async () => {
    (runAutoAdjustExecution as jest.Mock).mockResolvedValueOnce({
      status: "duplicate",
      listingId: requestPayload.listingId,
      runKey: requestPayload.runKey,
      traceId: requestPayload.traceId,
      ruleRevision: requestPayload.ruleRevision,
      evaluationAt: "2026-04-22T02:00:00.000Z",
      duplicateOfRunKey: requestPayload.runKey
    });

    const response = await POST(schedulerRequest(requestPayload));

    expect(runAutoAdjustExecution).toHaveBeenCalledWith(requestPayload);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "duplicate",
      duplicateOfRunKey: "run-20260422-001"
    });
  });

  it("rejects malformed scheduler requests", async () => {
    (runAutoAdjustExecution as jest.Mock).mockRejectedValueOnce(
      new ZodError([
        {
          code: "too_small",
          minimum: 1,
          inclusive: true,
          origin: "string",
          path: ["runKey"],
          message: "Too small"
        }
      ])
    );

    const response = await POST(
      schedulerRequest({
        ...requestPayload,
        runKey: ""
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "INVALID_REQUEST"
      }
    });
  });

  it("rejects scheduler calls without the configured bearer token", async () => {
    const response = await POST(schedulerRequest(requestPayload, "wrong-token"));

    expect(response.status).toBe(401);
    expect(runAutoAdjustExecution).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "UNAUTHORIZED"
      }
    });
  });

  it("fails closed when scheduler authorization is not configured", async () => {
    delete process.env.AUTO_ADJUST_SCHEDULER_TOKEN;

    const response = await POST(schedulerRequest(requestPayload));

    expect(response.status).toBe(503);
    expect(runAutoAdjustExecution).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "SCHEDULER_AUTH_NOT_CONFIGURED"
      }
    });
  });
});
