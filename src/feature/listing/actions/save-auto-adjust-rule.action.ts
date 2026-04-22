import {
  autoAdjustRuleFieldLabels,
  buildAutoAdjustRuleFormValues,
  emptyAutoAdjustRuleFormValues,
  RetryableAutoAdjustRuleSaveError,
  toAutoAdjustRuleDisplayModel,
  validateAutoAdjustRuleInput,
  type AutoAdjustRule,
  type AutoAdjustRuleDisplayModel,
  type AutoAdjustRuleField,
  type AutoAdjustRuleFieldErrors,
  type AutoAdjustRuleFormValues,
  type AutoAdjustRuleInput
} from "@/domain/pricing/auto-adjust-rule";
import { getAutoAdjustRuleRepository } from "@/infra/pricing/auto-adjust-rule.repository";

export type SaveAutoAdjustRuleFormState = {
  submissionStatus: "idle" | "success" | "error";
  values: AutoAdjustRuleFormValues;
  fieldErrors: AutoAdjustRuleFieldErrors;
  errorFieldLabels: string[];
  formError: string | null;
  recoveryGuide: string | null;
  activeRule: AutoAdjustRuleDisplayModel | null;
};

type SaveAutoAdjustRuleDependencies = {
  saveAutoAdjustRule: (input: AutoAdjustRuleInput) => Promise<AutoAdjustRule | null>;
};

export function createInitialSaveAutoAdjustRuleFormState(
  activeRule: AutoAdjustRule | null
): SaveAutoAdjustRuleFormState {
  const activeDisplayRule = toAutoAdjustRuleDisplayModel(activeRule);

  return {
    submissionStatus: "idle",
    values: buildAutoAdjustRuleFormValues(activeRule),
    fieldErrors: {},
    errorFieldLabels: [],
    formError: null,
    recoveryGuide: null,
    activeRule: activeDisplayRule
  };
}

function readTextField(formData: FormData, key: AutoAdjustRuleField): string {
  const rawValue = formData.get(key);

  return typeof rawValue === "string" ? rawValue : "";
}

function extractFormValues(formData: FormData): AutoAdjustRuleFormValues {
  return {
    periodDays: readTextField(formData, "periodDays"),
    discountRatePercent: readTextField(formData, "discountRatePercent"),
    floorPriceKrw: readTextField(formData, "floorPriceKrw")
  };
}

function buildValidationErrorFieldLabels(
  fieldErrors: AutoAdjustRuleFieldErrors
): string[] {
  return (Object.keys(fieldErrors) as AutoAdjustRuleField[]).map(
    (field) => autoAdjustRuleFieldLabels[field]
  );
}

function buildPreservedValues(
  previousState: SaveAutoAdjustRuleFormState,
  attemptedValues: AutoAdjustRuleFormValues
): AutoAdjustRuleFormValues {
  if (!previousState.activeRule) {
    return attemptedValues;
  }

  return {
    periodDays: previousState.activeRule.periodDays,
    discountRatePercent: previousState.activeRule.discountRatePercent,
    floorPriceKrw: previousState.activeRule.floorPriceKrw
  };
}

function toErrorState(
  previousState: SaveAutoAdjustRuleFormState,
  attemptedValues: AutoAdjustRuleFormValues,
  input: {
    fieldErrors?: AutoAdjustRuleFieldErrors;
    formError: string;
    recoveryGuide: string;
  }
): SaveAutoAdjustRuleFormState {
  const fieldErrors = input.fieldErrors ?? {};

  return {
    submissionStatus: "error",
    values: buildPreservedValues(previousState, attemptedValues),
    fieldErrors,
    errorFieldLabels: buildValidationErrorFieldLabels(fieldErrors),
    formError: input.formError,
    recoveryGuide: input.recoveryGuide,
    activeRule: previousState.activeRule
  };
}

export async function handleSaveAutoAdjustRuleSubmission(
  dependencies: SaveAutoAdjustRuleDependencies,
  rawListingId: string,
  currentPriceKrw: number,
  previousState: SaveAutoAdjustRuleFormState,
  formData: FormData
): Promise<SaveAutoAdjustRuleFormState> {
  const values = extractFormValues(formData);
  const validationResult = validateAutoAdjustRuleInput(
    {
      listingId: rawListingId,
      ...values
    },
    {
      currentPriceKrw
    }
  );

  if (!validationResult.ok) {
    return toErrorState(previousState, values, {
      fieldErrors: validationResult.fieldErrors,
      formError:
        "유효성 검증에 실패했습니다. 마지막으로 저장된 유효 규칙은 그대로 유지됩니다.",
      recoveryGuide: validationResult.recoveryGuide
    });
  }

  try {
    const storedRule = await dependencies.saveAutoAdjustRule(validationResult.rule);

    if (!storedRule) {
      return toErrorState(previousState, values, {
        formError: "매물을 다시 불러온 뒤 가격조정 규칙을 저장해 주세요.",
        recoveryGuide:
          "다른 화면에서 매물이 삭제되었을 수 있습니다. 목록으로 돌아가 매물을 다시 확인해 주세요."
      });
    }

    return {
      submissionStatus: "success",
      values: buildAutoAdjustRuleFormValues(storedRule),
      fieldErrors: {},
      errorFieldLabels: [],
      formError: null,
      recoveryGuide: null,
      activeRule: toAutoAdjustRuleDisplayModel(storedRule)
    };
  } catch (error) {
    if (error instanceof RetryableAutoAdjustRuleSaveError) {
      return toErrorState(previousState, values, {
        formError:
          "가격조정 규칙 저장에 실패했습니다. 마지막으로 저장된 유효 규칙은 유지됩니다.",
        recoveryGuide: "잠시 후 같은 값으로 다시 저장해 주세요."
      });
    }

    throw error;
  }
}

export async function saveActiveAutoAdjustRuleForListing(
  input: AutoAdjustRuleInput
): Promise<AutoAdjustRule | null> {
  return getAutoAdjustRuleRepository().upsertActive(input);
}

export async function getActiveAutoAdjustRuleForListing(
  listingId: string
): Promise<AutoAdjustRule | null> {
  return getAutoAdjustRuleRepository().findActiveByListingId(listingId);
}

export { emptyAutoAdjustRuleFormValues };

