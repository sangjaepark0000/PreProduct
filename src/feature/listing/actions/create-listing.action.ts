import { ZodError } from "zod";

import { RetryableCreateListingError } from "@/domain/listing/listing.errors";
import { createListingInputSchema } from "@/domain/listing/listing";
import {
  prelistingStatusSchema,
  prelistingStatusValues
} from "@/domain/prelisting-status/prelisting-status";

export type CreateListingFormValues = {
  title: string;
  category: string;
  keySpecificationsText: string;
  priceKrw: string;
  status: string;
};

export type CreateListingFieldErrors = Partial<
  Record<keyof CreateListingFormValues, string>
>;

export type CreateListingFormState = {
  status: "idle" | "error";
  values: CreateListingFormValues;
  fieldErrors: CreateListingFieldErrors;
  errorFieldLabels: string[];
  formError: string | null;
};

type CreateListingSubmissionSuccess = {
  status: "success";
  listingId: string;
};

type CreateListingSubmissionDependencies = {
  createListing: (
    input: unknown
  ) => Promise<{
    id: string;
  }>;
};

const emptyFormValues: CreateListingFormValues = {
  title: "",
  category: "",
  keySpecificationsText: "",
  priceKrw: "",
  status: prelistingStatusValues[0]
};

export const initialCreateListingFormState: CreateListingFormState = {
  status: "idle",
  values: emptyFormValues,
  fieldErrors: {},
  errorFieldLabels: [],
  formError: null
};

function readTextField(formData: FormData, key: keyof CreateListingFormValues): string {
  const rawValue = formData.get(key);

  return typeof rawValue === "string" ? rawValue : "";
}

function extractFormValues(formData: FormData): CreateListingFormValues {
  return {
    title: readTextField(formData, "title"),
    category: readTextField(formData, "category"),
    keySpecificationsText: readTextField(formData, "keySpecificationsText"),
    priceKrw: readTextField(formData, "priceKrw"),
    status: readTextField(formData, "status")
  };
}

function splitKeySpecifications(rawText: string): string[] {
  return rawText
    .split(/\r?\n/u)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function toFormErrorState(
  values: CreateListingFormValues,
  fieldErrors: CreateListingFieldErrors = {},
  errorFieldLabels: string[] = [],
  formError: string | null = null
): CreateListingFormState {
  return {
    status: "error",
    values,
    fieldErrors,
    errorFieldLabels,
    formError
  };
}

const fieldLabelMap: Record<keyof CreateListingFormValues, string> = {
  title: "제목",
  category: "카테고리",
  keySpecificationsText: "핵심 스펙",
  priceKrw: "가격",
  status: "상태"
};

function mapZodErrorToFieldErrors(
  error: ZodError,
  values: CreateListingFormValues
): CreateListingFieldErrors {
  const fieldErrors: CreateListingFieldErrors = {};

  error.issues.forEach((issue) => {
    const [field] = issue.path;

    if (field === "title") {
      fieldErrors.title = issue.message;
      return;
    }

    if (field === "category") {
      fieldErrors.category = issue.message;
      return;
    }

    if (field === "keySpecifications") {
      fieldErrors.keySpecificationsText = issue.message;
      return;
    }

    if (field === "priceKrw") {
      const trimmedPrice = values.priceKrw.trim();

      if (trimmedPrice.length === 0) {
        fieldErrors.priceKrw = "가격을 입력해 주세요.";
        return;
      }

      if (!/^\d+$/u.test(trimmedPrice)) {
        fieldErrors.priceKrw = "가격은 숫자만 입력해 주세요.";
        return;
      }

      fieldErrors.priceKrw = issue.message;
      return;
    }

    if (field === "status") {
      fieldErrors.status = issue.message;
    }
  });

  return fieldErrors;
}

function buildValidationErrorFieldLabels(
  fieldErrors: CreateListingFieldErrors
): string[] {
  return (Object.keys(fieldErrors) as Array<keyof CreateListingFieldErrors>)
    .map((field) => (field ? fieldLabelMap[field] : null))
    .filter((label): label is string => Boolean(label));
}

function buildValidationSummary(errorFieldLabels: string[]): string {
  if (errorFieldLabels.length === 0) {
    return "입력 내용을 확인한 뒤 다시 등록해 주세요.";
  }

  return `입력이 필요한 항목이 있습니다. ${errorFieldLabels.join(", ")}을 확인한 뒤 다시 등록해 주세요.`;
}

export async function handleCreateListingSubmission(
  dependencies: CreateListingSubmissionDependencies,
  _previousState: CreateListingFormState,
  formData: FormData
): Promise<CreateListingFormState | CreateListingSubmissionSuccess> {
  const values = extractFormValues(formData);

  try {
    const parsedInput = createListingInputSchema.parse({
      title: values.title,
      category: values.category,
      keySpecifications: splitKeySpecifications(values.keySpecificationsText),
      priceKrw: values.priceKrw,
      status: prelistingStatusSchema.parse(values.status)
    });
    const listing = await dependencies.createListing({
      ...parsedInput,
      initialStatus: parsedInput.status,
      currentStatus: parsedInput.status
    });

    return {
      status: "success",
      listingId: listing.id
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = mapZodErrorToFieldErrors(error, values);
      const errorFieldLabels = buildValidationErrorFieldLabels(fieldErrors);

      return toFormErrorState(
        values,
        fieldErrors,
        errorFieldLabels,
        buildValidationSummary(errorFieldLabels)
      );
    }

    if (error instanceof RetryableCreateListingError) {
      return toFormErrorState(
        values,
        {},
        [],
        "저장에 실패했습니다. 입력 내용은 유지됐으니 다시 시도해 주세요."
      );
    }

    throw error;
  }
}
