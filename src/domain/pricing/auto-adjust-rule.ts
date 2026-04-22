import { z, type ZodError } from "zod";

import { listingIdSchema, listingPricePolicy } from "@/domain/listing/listing";

export const autoAdjustRulePolicy = {
  minPeriodDays: 1,
  maxPeriodDays: 365,
  minDiscountRatePercent: 1,
  maxDiscountRatePercent: 50
} as const;

export const autoAdjustRuleFieldLabels = {
  periodDays: "주기(일)",
  discountRatePercent: "인하율(%)",
  floorPriceKrw: "최저가 하한 (원)"
} as const;

export type AutoAdjustRuleField = keyof typeof autoAdjustRuleFieldLabels;

export type AutoAdjustRuleFieldErrors = Partial<
  Record<AutoAdjustRuleField, string>
>;

export type AutoAdjustRuleFormValues = Record<AutoAdjustRuleField, string>;

export const emptyAutoAdjustRuleFormValues: AutoAdjustRuleFormValues = {
  periodDays: "",
  discountRatePercent: "",
  floorPriceKrw: ""
};

export const autoAdjustRuleInputSchema = z.object({
  listingId: listingIdSchema,
  periodDays: z.coerce
    .number()
    .int("주기는 정수 일수로 입력해 주세요.")
    .min(
      autoAdjustRulePolicy.minPeriodDays,
      "주기는 1일 이상 입력해 주세요."
    )
    .max(
      autoAdjustRulePolicy.maxPeriodDays,
      `주기는 ${autoAdjustRulePolicy.maxPeriodDays}일 이하로 입력해 주세요.`
    ),
  discountRatePercent: z.coerce
    .number()
    .int("인하율은 정수 퍼센트로 입력해 주세요.")
    .min(
      autoAdjustRulePolicy.minDiscountRatePercent,
      "인하율은 1% 이상 입력해 주세요."
    )
    .max(
      autoAdjustRulePolicy.maxDiscountRatePercent,
      `인하율은 ${autoAdjustRulePolicy.maxDiscountRatePercent}% 이하로 입력해 주세요.`
    ),
  floorPriceKrw: z.coerce
    .number()
    .int("최저가 하한은 정수 원화로 입력해 주세요.")
    .min(
      listingPricePolicy.minPriceKrw,
      "최저가 하한은 1원 이상 입력해 주세요."
    )
    .max(
      listingPricePolicy.maxPriceKrw,
      `최저가 하한은 ${listingPricePolicy.maxPriceKrw.toLocaleString(
        "ko-KR"
      )}원 이하로 입력해 주세요.`
    )
    .refine(
      (value) => value % listingPricePolicy.stepKrw === 0,
      "최저가 하한은 1,000원 단위로 입력해 주세요."
    )
});

export const autoAdjustRuleSchema = autoAdjustRuleInputSchema.extend({
  enabled: z.boolean(),
  updatedAt: z.iso.datetime()
});

export type AutoAdjustRuleInput = z.infer<typeof autoAdjustRuleInputSchema>;
export type AutoAdjustRule = z.infer<typeof autoAdjustRuleSchema>;

export type AutoAdjustRuleDisplayModel = AutoAdjustRuleFormValues & {
  enabled: boolean;
  updatedAt: string;
  summary: string;
};

export type AutoAdjustRuleValidationResult =
  | {
      ok: true;
      rule: AutoAdjustRuleInput;
      fieldErrors: Record<string, never>;
      recoveryGuide: null;
    }
  | {
      ok: false;
      fieldErrors: AutoAdjustRuleFieldErrors;
      recoveryGuide: string;
    };

export class RetryableAutoAdjustRuleSaveError extends Error {
  constructor(message = "Retryable auto-adjust rule persistence failure.", options?: ErrorOptions) {
    super(message, options);
    this.name = "RetryableAutoAdjustRuleSaveError";
  }
}

const recoveryGuideByField: Record<AutoAdjustRuleField, string> = {
  periodDays: "1일 이상 365일 이하의 정수로 다시 입력해 주세요.",
  discountRatePercent: "1% 이상 50% 이하의 정수로 다시 입력해 주세요.",
  floorPriceKrw:
    "현재 가격보다 낮은 금액을 1,000원 단위 정수 원화로 다시 입력해 주세요."
};

const priceFormatter = new Intl.NumberFormat("ko-KR");

function formatPriceKrw(priceKrw: number): string {
  return `${priceFormatter.format(priceKrw)}원`;
}

function mapZodErrorToFieldErrors(error: ZodError): AutoAdjustRuleFieldErrors {
  const fieldErrors: AutoAdjustRuleFieldErrors = {};

  error.issues.forEach((issue) => {
    const [field] = issue.path;

    if (field === "periodDays") {
      fieldErrors.periodDays = issue.message;
      return;
    }

    if (field === "discountRatePercent") {
      fieldErrors.discountRatePercent = issue.message;
      return;
    }

    if (field === "floorPriceKrw") {
      fieldErrors.floorPriceKrw = issue.message;
    }
  });

  return fieldErrors;
}

function buildRecoveryGuide(fieldErrors: AutoAdjustRuleFieldErrors): string {
  const guides = (Object.keys(fieldErrors) as AutoAdjustRuleField[]).map(
    (field) => recoveryGuideByField[field]
  );

  if (guides.length === 0) {
    return "입력값을 확인한 뒤 다시 저장해 주세요.";
  }

  return Array.from(new Set(guides)).join(" ");
}

export function validateAutoAdjustRuleInput(
  rawInput: unknown,
  options: {
    currentPriceKrw?: number;
  } = {}
): AutoAdjustRuleValidationResult {
  const parsedRule = autoAdjustRuleInputSchema.safeParse(rawInput);

  if (!parsedRule.success) {
    const fieldErrors = mapZodErrorToFieldErrors(parsedRule.error);

    return {
      ok: false,
      fieldErrors,
      recoveryGuide: buildRecoveryGuide(fieldErrors)
    };
  }

  if (
    typeof options.currentPriceKrw === "number" &&
    parsedRule.data.floorPriceKrw >= options.currentPriceKrw
  ) {
    const fieldErrors: AutoAdjustRuleFieldErrors = {
      floorPriceKrw: "최저가 하한은 현재 가격보다 낮아야 합니다."
    };

    return {
      ok: false,
      fieldErrors,
      recoveryGuide: buildRecoveryGuide(fieldErrors)
    };
  }

  return {
    ok: true,
    rule: parsedRule.data,
    fieldErrors: {},
    recoveryGuide: null
  };
}

export function buildAutoAdjustRuleFormValues(
  rule: AutoAdjustRule | null
): AutoAdjustRuleFormValues {
  if (!rule) {
    return emptyAutoAdjustRuleFormValues;
  }

  return {
    periodDays: String(rule.periodDays),
    discountRatePercent: String(rule.discountRatePercent),
    floorPriceKrw: String(rule.floorPriceKrw)
  };
}

export function toAutoAdjustRuleDisplayModel(
  rule: AutoAdjustRule | null
): AutoAdjustRuleDisplayModel | null {
  if (!rule) {
    return null;
  }

  const values = buildAutoAdjustRuleFormValues(rule);

  return {
    ...values,
    enabled: rule.enabled,
    updatedAt: rule.updatedAt,
    summary: `${rule.periodDays}일마다 ${rule.discountRatePercent}% 인하, 최저 ${formatPriceKrw(
      rule.floorPriceKrw
    )}`
  };
}
