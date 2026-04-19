import { ZodError } from "zod";

import { RetryableUpdateListingStatusError } from "@/domain/listing/listing.errors";
import { updateListingStatusInputSchema } from "@/domain/listing/listing";
import { prelistingStatusValues } from "@/domain/prelisting-status/prelisting-status";

export type UpdateListingStatusFormValues = {
  status: string;
};

export type UpdateListingStatusFieldErrors = Partial<
  Record<keyof UpdateListingStatusFormValues, string>
>;

export type UpdateListingStatusFormState = {
  submissionStatus: "idle" | "success" | "error";
  values: UpdateListingStatusFormValues;
  fieldErrors: UpdateListingStatusFieldErrors;
  formError: string | null;
  currentStatus: string;
  updatedAt: string;
};

type UpdateListingStatusSubmissionDependencies = {
  updateListingStatus: (
    input: unknown
  ) => Promise<{
    currentStatus: string;
    updatedAt: string;
  } | null>;
};

export function createInitialUpdateListingStatusFormState(input: {
  currentStatus: string;
  updatedAt: string;
}): UpdateListingStatusFormState {
  return {
    submissionStatus: "idle",
    values: {
      status: input.currentStatus
    },
    fieldErrors: {},
    formError: null,
    currentStatus: input.currentStatus,
    updatedAt: input.updatedAt
  };
}

function readTextField(formData: FormData, key: keyof UpdateListingStatusFormValues): string {
  const rawValue = formData.get(key);

  return typeof rawValue === "string" ? rawValue : "";
}

function toFormState(
  previousState: UpdateListingStatusFormState,
  input: Partial<UpdateListingStatusFormState>
): UpdateListingStatusFormState {
  return {
    ...previousState,
    ...input,
    values: input.values ?? previousState.values,
    fieldErrors: input.fieldErrors ?? previousState.fieldErrors,
    formError: input.formError ?? null,
    currentStatus: input.currentStatus ?? previousState.currentStatus,
    updatedAt: input.updatedAt ?? previousState.updatedAt
  };
}

function mapZodErrorToFieldErrors(error: ZodError): UpdateListingStatusFieldErrors {
  const fieldErrors: UpdateListingStatusFieldErrors = {};

  error.issues.forEach((issue) => {
    const [field] = issue.path;

    if (field === "status") {
      fieldErrors.status = issue.message;
    }
  });

  return fieldErrors;
}

export async function handleUpdateListingStatusSubmission(
  dependencies: UpdateListingStatusSubmissionDependencies,
  rawListingId: string,
  previousState: UpdateListingStatusFormState,
  formData: FormData
): Promise<UpdateListingStatusFormState> {
  const values = {
    status: readTextField(formData, "status") || prelistingStatusValues[0]
  };

  try {
    const parsedInput = updateListingStatusInputSchema.parse({
      listingId: rawListingId,
      status: values.status
    });
    const listing = await dependencies.updateListingStatus(parsedInput);

    if (!listing) {
      return toFormState(previousState, {
        submissionStatus: "error",
        values,
        fieldErrors: {},
        formError: "매물을 다시 불러온 뒤 상태를 저장해 주세요."
      });
    }

    return {
      submissionStatus: "success",
      values: {
        status: listing.currentStatus
      },
      fieldErrors: {},
      formError: null,
      currentStatus: listing.currentStatus,
      updatedAt: listing.updatedAt
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return toFormState(previousState, {
        submissionStatus: "error",
        values,
        fieldErrors: mapZodErrorToFieldErrors(error)
      });
    }

    if (error instanceof RetryableUpdateListingStatusError) {
      return toFormState(previousState, {
        submissionStatus: "error",
        values,
        fieldErrors: {},
        formError: "상태 저장에 실패했습니다. 잠시 후 다시 시도해 주세요."
      });
    }

    throw error;
  }
}
