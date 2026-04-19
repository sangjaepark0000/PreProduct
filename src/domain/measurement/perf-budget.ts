import perfBudgetConfig from "@/domain/measurement/perf-budget.config.json";

export type AppShellMeasurements = {
  responseStartMs: number;
  domContentLoadedMs: number;
  loadMs: number;
  htmlTransferBytes: number;
  totalRequests: number;
};

export type BudgetResult = {
  metric: keyof AppShellMeasurements;
  actual: number;
  threshold: number;
  pass: boolean;
};

export const appShellBudget = perfBudgetConfig.appShell;

export function evaluateAppShellBudget(
  measurements: AppShellMeasurements
): BudgetResult[] {
  return (
    Object.keys(appShellBudget) as Array<keyof typeof appShellBudget>
  ).map((metric) => ({
    metric,
    actual: measurements[metric],
    threshold: appShellBudget[metric],
    pass: measurements[metric] <= appShellBudget[metric]
  }));
}
