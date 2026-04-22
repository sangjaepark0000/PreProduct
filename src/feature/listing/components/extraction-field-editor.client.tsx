"use client";

import { useMemo, useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  getAiExtractionConfidenceLabel,
  type AiExtractionConfirmedFields,
  type AiExtractionDraft
} from "@/shared/contracts/ai-extraction";
import {
  buildAiExtractionReviewedV1,
  type AiExtractionReviewedV1
} from "@/shared/contracts/events/ai-extraction-reviewed.v1";

export type ExtractionReviewSession = {
  clientRequestId: string;
  idempotencyKey: string;
  requestVersion: number;
  draft: AiExtractionDraft;
};

type ExtractionFieldEditorProps = {
  session: ExtractionReviewSession;
  onConfirm: (result: {
    fields: AiExtractionConfirmedFields;
    event: AiExtractionReviewedV1;
  }) => void;
  onDismiss: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

type ValidationErrors = Partial<Record<keyof AiExtractionConfirmedFields, string>>;

function parseSpecifications(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function validateFields(input: {
  title: string;
  category: string;
  keySpecificationsText: string;
}): {
  fields: AiExtractionConfirmedFields | null;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};
  const keySpecifications = parseSpecifications(input.keySpecificationsText);
  const title = input.title.trim();
  const category = input.category.trim();

  if (!title) {
    errors.title = "제목을 1자 이상 입력해 주세요.";
  }

  if (!category) {
    errors.category = "카테고리를 1자 이상 입력해 주세요.";
  }

  if (keySpecifications.length < 1) {
    errors.keySpecifications = "핵심 스펙을 1개 이상 입력해 주세요.";
  }

  if (Object.keys(errors).length > 0) {
    return { fields: null, errors };
  }

  return {
    fields: {
      title,
      category,
      keySpecifications
    },
    errors
  };
}

export function ExtractionFieldEditor({
  session,
  onConfirm,
  onDismiss,
  onDirtyChange
}: ExtractionFieldEditorProps) {
  const [title, setTitle] = useState(session.draft.title);
  const [category, setCategory] = useState(session.draft.category);
  const [keySpecificationsText, setKeySpecificationsText] = useState(
    session.draft.keySpecifications.join("\n")
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [statusMessage, setStatusMessage] = useState(
    "AI 초안을 검토하고 필요하면 수정해 주세요."
  );
  const confidenceLabel = useMemo(
    () => getAiExtractionConfidenceLabel(session.draft.confidence),
    [session.draft.confidence]
  );

  function handleConfirm() {
    const validation = validateFields({
      title,
      category,
      keySpecificationsText
    });

    setErrors(validation.errors);

    if (!validation.fields) {
      setStatusMessage("확정하려면 표시된 오류를 먼저 수정해 주세요.");
      return;
    }

    const event = buildAiExtractionReviewedV1({
      clientRequestId: session.clientRequestId,
      idempotencyKey: session.idempotencyKey,
      requestVersion: session.requestVersion,
      traceId: session.clientRequestId,
      draft: session.draft,
      confirmedFields: validation.fields
    });

    onConfirm({
      fields: validation.fields,
      event
    });
    setStatusMessage("AI 초안을 확정했습니다.");
  }

  function markDirty() {
    onDirtyChange?.(true);
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Box
      data-testid="extraction-field-editor"
      sx={{
        border: "1px solid rgba(11, 110, 153, 0.24)",
        p: { xs: 2, md: 3 }
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between"
          }}
        >
          <Stack spacing={0.5}>
            <Typography component="h2" variant="h5">
              AI 초안 검토
            </Typography>
            <Typography color="text.secondary" variant="body2">
              확정 전까지 최종 등록 정보에는 반영되지 않습니다.
            </Typography>
          </Stack>
          <Chip
            data-testid="extraction-confidence-label"
            label={confidenceLabel.displayText}
            color={confidenceLabel.tone === "low" ? "warning" : "info"}
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        </Stack>

        {hasErrors ? (
          <Alert role="alert" severity="error" aria-live="assertive">
            {Object.values(errors).join(" ")}
          </Alert>
        ) : null}

        <TextField
          label="AI 초안 제목"
          value={title}
          onChange={(event) => {
            markDirty();
            setTitle(event.target.value);
          }}
          error={Boolean(errors.title)}
          helperText={errors.title ?? "제목 초안을 수정할 수 있습니다."}
          fullWidth
          autoComplete="off"
          slotProps={{ htmlInput: { maxLength: 120 } }}
        />

        <TextField
          label="AI 초안 카테고리"
          value={category}
          onChange={(event) => {
            markDirty();
            setCategory(event.target.value);
          }}
          error={Boolean(errors.category)}
          helperText={errors.category ?? "카테고리 초안을 수정할 수 있습니다."}
          fullWidth
          autoComplete="off"
          slotProps={{ htmlInput: { maxLength: 60 } }}
        />

        <TextField
          label="AI 초안 핵심 스펙"
          value={keySpecificationsText}
          onChange={(event) => {
            markDirty();
            setKeySpecificationsText(event.target.value);
          }}
          error={Boolean(errors.keySpecifications)}
          helperText={
            errors.keySpecifications ?? "한 줄에 한 개씩 검토해 주세요."
          }
          fullWidth
          multiline
          minRows={3}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ alignItems: { xs: "stretch", sm: "center" } }}
        >
          <Button
            type="button"
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={handleConfirm}
            data-testid="extraction-confirm-button"
            sx={{ minHeight: 44 }}
          >
            초안 확정
          </Button>
          <Button
            type="button"
            variant="outlined"
            startIcon={<CloseIcon />}
            onClick={onDismiss}
            sx={{ minHeight: 44 }}
          >
            닫기
          </Button>
        </Stack>

        <Typography
          role="status"
          aria-live="polite"
          aria-atomic="true"
          variant="body2"
          color={hasErrors ? "error.main" : "text.secondary"}
        >
          {statusMessage}
        </Typography>
      </Stack>
    </Box>
  );
}
