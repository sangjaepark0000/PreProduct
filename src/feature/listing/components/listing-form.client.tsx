"use client";

import { useActionState, useRef, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  initialCreateListingFormState,
  type CreateListingFormState
} from "@/feature/listing/actions/create-listing.action";
import { prelistingStatusValues } from "@/domain/prelisting-status/prelisting-status";
import { ListingSubmitBar } from "@/feature/listing/components/listing-submit-bar.client";
import { PhotoUploader } from "@/feature/listing/components/photo-uploader.client";
import {
  ExtractionFieldEditor,
  type ExtractionReviewSession
} from "@/feature/listing/components/extraction-field-editor.client";
import type { AiExtractionResult } from "@/shared/contracts/ai-extraction";
import type { AiExtractionReviewedV1 } from "@/shared/contracts/events/ai-extraction-reviewed.v1";

type ListingFormProps = {
  action: (
    previousState: CreateListingFormState,
    formData: FormData
  ) => Promise<CreateListingFormState>;
};

export function ListingForm({ action }: ListingFormProps) {
  const [state, formAction, pending] = useActionState<CreateListingFormState, FormData>(
    action,
    initialCreateListingFormState
  );
  const formResetKey = JSON.stringify(state.values);

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Stack
          key={formResetKey}
          spacing={3}
          component="form"
          action={formAction}
          noValidate
        >
          <Stack spacing={1.5}>
            <Chip
              label="Story 1.3 필수 필드 검증"
              color="secondary"
              sx={{ alignSelf: "flex-start", fontWeight: 700 }}
            />
            <Typography component="h1" variant="h2">
              설명 없이 바로 시작되는 중고 매물 등록
            </Typography>
            <Typography color="text.secondary" variant="body1">
              제목, 카테고리, 핵심 스펙, 가격과 상태만 고르면 저장 후 바로 상세
              화면으로 이동합니다.
            </Typography>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              border: "1px solid rgba(11, 110, 153, 0.12)",
              p: { xs: 2, md: 4 }
            }}
          >
            <Stack spacing={2.5}>
              {state.formError ? (
                <Alert severity="error" aria-live="polite" aria-atomic="true">
                  <AlertTitle>
                    {state.errorFieldLabels.length > 0
                      ? "입력 내용을 먼저 확인해 주세요."
                      : "저장에 실패했습니다."}
                  </AlertTitle>
                  <Stack spacing={1}>
                    <Typography variant="body2">{state.formError}</Typography>
                    {state.errorFieldLabels.length > 0 ? (
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        sx={{ flexWrap: "wrap" }}
                      >
                        {state.errorFieldLabels.map((label) => (
                          <Chip
                            key={label}
                            label={label}
                            color="error"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Stack>
                    ) : null}
                  </Stack>
                </Alert>
              ) : null}

              <ListingDraftFields
                key={formResetKey}
                values={state.values}
                fieldErrors={state.fieldErrors}
              />

              <TextField
                name="priceKrw"
                label="가격 (원)"
                defaultValue={state.values.priceKrw}
                error={Boolean(state.fieldErrors.priceKrw)}
                helperText={state.fieldErrors.priceKrw ?? "숫자만 입력해 주세요."}
                fullWidth
                type="number"
                slotProps={{
                  htmlInput: {
                    min: 1,
                    step: 1000,
                    inputMode: "numeric"
                  }
                }}
              />

              <FormControl error={Boolean(state.fieldErrors.status)}>
                <FormLabel id="listing-status-label">현재 상태</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="listing-status-label"
                  name="status"
                  defaultValue={state.values.status}
                >
                  {prelistingStatusValues.map((status) => (
                    <FormControlLabel
                      key={status}
                      value={status}
                      control={<Radio />}
                      label={status}
                    />
                  ))}
                </RadioGroup>
                {state.fieldErrors.status ? (
                  <FormHelperText>{state.fieldErrors.status}</FormHelperText>
                ) : null}
              </FormControl>
            </Stack>
          </Paper>

          <ListingSubmitBar
            pending={pending}
            hasErrors={state.status === "error"}
            errorFieldLabels={state.errorFieldLabels}
          />
        </Stack>
      </Container>
    </Box>
  );
}

type ListingDraftFieldsProps = {
  values: CreateListingFormState["values"];
  fieldErrors: CreateListingFormState["fieldErrors"];
};

function ListingDraftFields({ values, fieldErrors }: ListingDraftFieldsProps) {
  const [title, setTitle] = useState(values.title);
  const [category, setCategory] = useState(values.category);
  const [keySpecificationsText, setKeySpecificationsText] = useState(
    values.keySpecificationsText
  );
  const [reviewSession, setReviewSession] =
    useState<ExtractionReviewSession | null>(null);
  const [reviewedEvent, setReviewedEvent] =
    useState<AiExtractionReviewedV1 | null>(null);
  const [reviewStatusMessage, setReviewStatusMessage] = useState("");
  const reviewSessionRef = useRef<ExtractionReviewSession | null>(null);
  const reviewDirtyRef = useRef(false);

  function setActiveReviewSession(session: ExtractionReviewSession | null) {
    reviewSessionRef.current = session;
    setReviewSession(session);
  }

  function prepareAiDraftReview(result: AiExtractionResult): boolean {
    const currentSession = reviewSessionRef.current;

    if (currentSession && reviewDirtyRef.current) {
      setReviewStatusMessage(
        "수정 중인 AI 초안을 유지했습니다. 새 초안은 자동 반영되지 않았습니다."
      );
      return false;
    }

    if (currentSession && result.requestVersion < currentSession.requestVersion) {
      return false;
    }

    const nextSession = {
      clientRequestId: result.clientRequestId,
      idempotencyKey: result.idempotencyKey,
      requestVersion: result.requestVersion,
      draft: result.draft
    };

    reviewDirtyRef.current = false;
    setActiveReviewSession(nextSession);
    setReviewStatusMessage("");
    return true;
  }

  function clearCleanReviewSession() {
    if (reviewDirtyRef.current) {
      return;
    }

    setActiveReviewSession(null);
    setReviewStatusMessage("");
  }

  return (
    <>
      <PhotoUploader
        onDraftReady={prepareAiDraftReview}
        onDraftInvalidated={clearCleanReviewSession}
        onFallback={() => {
          reviewDirtyRef.current = false;
          setActiveReviewSession(null);
        }}
      />

      {reviewSession ? (
        <ExtractionFieldEditor
          key={`${reviewSession.clientRequestId}:${reviewSession.requestVersion}`}
          session={reviewSession}
          onConfirm={({ fields, event }) => {
            setTitle(fields.title);
            setCategory(fields.category);
            setKeySpecificationsText(fields.keySpecifications.join("\n"));
            setReviewedEvent(event);
            reviewDirtyRef.current = false;
            setActiveReviewSession(null);
            setReviewStatusMessage("AI 초안을 확정했습니다.");
          }}
          onDismiss={() => {
            reviewDirtyRef.current = false;
            setActiveReviewSession(null);
            setReviewStatusMessage("AI 초안 검토를 닫았습니다.");
          }}
          onDirtyChange={(isDirty) => {
            reviewDirtyRef.current = isDirty;
          }}
        />
      ) : null}

      {reviewStatusMessage ? (
        <Typography
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="extraction-review-status"
          variant="body2"
          color="text.secondary"
        >
          {reviewStatusMessage}
        </Typography>
      ) : null}

      {reviewedEvent ? (
        <input
          type="hidden"
          name="aiExtractionReviewedEventId"
          value={reviewedEvent.eventId}
          data-testid="ai-extraction-reviewed-event-id"
        />
      ) : null}

      <Stack data-testid="listing-final-fields" spacing={2.5}>
        <TextField
          name="title"
          label="제목"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={Boolean(fieldErrors.title)}
          helperText={fieldErrors.title ?? "예: 맥북 에어 M3 13인치"}
          fullWidth
          autoComplete="off"
          slotProps={{ htmlInput: { maxLength: 120 } }}
        />

        <TextField
          name="category"
          label="카테고리"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          error={Boolean(fieldErrors.category)}
          helperText={fieldErrors.category ?? "예: 노트북, 카메라, 게임기"}
          fullWidth
          autoComplete="off"
          slotProps={{ htmlInput: { maxLength: 60 } }}
        />

        <TextField
          name="keySpecificationsText"
          label="핵심 스펙"
          value={keySpecificationsText}
          onChange={(event) => setKeySpecificationsText(event.target.value)}
          error={Boolean(fieldErrors.keySpecificationsText)}
          helperText={
            fieldErrors.keySpecificationsText ??
            "한 줄에 한 개씩 입력해 주세요. 예: 16GB RAM"
          }
          fullWidth
          multiline
          minRows={4}
        />
      </Stack>
    </>
  );
}
