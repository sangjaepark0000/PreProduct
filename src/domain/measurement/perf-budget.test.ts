import {
  evaluateAppShellBudget,
  appShellBudget
} from "@/domain/measurement/perf-budget";

describe("evaluateAppShellBudget", () => {
  it("passes when all measurements stay within the threshold", () => {
    const results = evaluateAppShellBudget({
      responseStartMs: appShellBudget.responseStartMs,
      domContentLoadedMs: appShellBudget.domContentLoadedMs - 200,
      loadMs: appShellBudget.loadMs - 400,
      htmlTransferBytes: appShellBudget.htmlTransferBytes - 512,
      totalRequests: appShellBudget.totalRequests - 2
    });

    expect(results.every((result) => result.pass)).toBe(true);
  });

  it("fails when a measurement crosses its threshold", () => {
    const results = evaluateAppShellBudget({
      responseStartMs: appShellBudget.responseStartMs + 1,
      domContentLoadedMs: appShellBudget.domContentLoadedMs,
      loadMs: appShellBudget.loadMs,
      htmlTransferBytes: appShellBudget.htmlTransferBytes,
      totalRequests: appShellBudget.totalRequests
    });

    expect(results.find((result) => result.metric === "responseStartMs")?.pass).toBe(
      false
    );
  });
});
