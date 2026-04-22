import { expect, test } from "@playwright/test";

const listingId = "0d3f4b7c-16ca-4a0e-a8bf-7f0f1d6aa2af";
const autoAdjustPath = "/api/pricing/auto-adjust";
const requestPayload = {
  listingId,
  runKey: "run-20260422-001",
  traceId: "trace-auto-adjust-20260422",
  requestedAt: "2026-04-22T02:00:00.000Z",
  ruleRevision: "rule-20260422-001",
  currentPriceKrw: 1_850_000
};

test.describe("Story 3.2 auto-adjust execution flow (ATDD RED)", () => {
  test.skip(
    "[P0] applies a due execution through the scheduler-facing route and returns the reason log",
    async ({ page }) => {
      await page.goto("about:blank");

      const response = await page.request.post(autoAdjustPath, {
        data: requestPayload
      });

      expect(response.ok()).toBe(true);

      const body = await response.json();

      expect(body.status).toBe("applied");
      expect(body.reasonCode).toBe("due-rule-applied");
      expect(body.runKey).toBe("run-20260422-001");
      expect(body.appliedAt).toBe("2026-04-22T02:00:00.000Z");
      expect(body.eventId).toMatch(/[0-9a-f-]{36}/u);
    }
  );

  test.skip(
    "[P0] keeps concurrent replays for the same run key from double-applying the listing",
    async ({ page }) => {
      await page.goto("about:blank");

      const [firstResponse, secondResponse] = await Promise.all([
        page.request.post(autoAdjustPath, { data: requestPayload }),
        page.request.post(autoAdjustPath, { data: requestPayload })
      ]);

      const [firstBody, secondBody] = await Promise.all([
        firstResponse.json(),
        secondResponse.json()
      ]);

      expect([firstBody.status, secondBody.status].sort()).toEqual([
        "applied",
        "duplicate"
      ]);
      expect(firstBody.runKey).toBe("run-20260422-001");
      expect(secondBody.runKey).toBe("run-20260422-001");
    }
  );
});
