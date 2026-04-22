"use client";

import { useEffect, useMemo, useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import LoginIcon from "@mui/icons-material/Login";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  buildPricingSuggestion,
  buildPricingSuggestionBasis,
  normalizePriceInput,
  pricingPolicy,
  validatePriceInput
} from "@/domain/pricing/pricing-suggestion";
import {
  buildPricingSuggestionAcceptedV1,
  type PricingSuggestionAcceptedV1
} from "@/shared/contracts/events/pricing-suggestion-accepted.v1";
import type {
  PricingConfirmationMode,
  PricingSuggestion
} from "@/shared/contracts/pricing-suggestion";

type PriceSuggestionCardProps = {
  title: string;
  category: string;
  keySpecificationsText: string;
  initialPriceKrw: string;
  fieldError?: string;
};

type PriceConfirmationErrorCode = "AUTH_REQUIRED";

type PriceConfirmationError = {
  code: PriceConfirmationErrorCode;
  message: string;
};

const numberFormatter = new Intl.NumberFormat("ko-KR");

function formatKrw(value: number): string {
  return `${numberFormatter.format(value)}원`;
}

function readTestConfirmationError(): PriceConfirmationError | null {
  if (typeof window === "undefined") {
    return null;
  }

  const code = window.localStorage.getItem("pricing-confirmation-error");

  if (code === "AUTH_REQUIRED") {
    return {
      code,
      message: "가격 확정을 계속하려면 다시 인증해 주세요."
    };
  }

  return null;
}

export function PriceSuggestionCard({
  title,
  category,
  keySpecificationsText,
  initialPriceKrw,
  fieldError
}: PriceSuggestionCardProps) {
  const [suggestion, setSuggestion] = useState<PricingSuggestion | null>(null);
  const [manualPrice, setManualPrice] = useState(initialPriceKrw);
  const [manualReason, setManualReason] = useState("");
  const [confirmedPrice, setConfirmedPrice] = useState(
    normalizePriceInput(initialPriceKrw)
  );
  const [confirmationMode, setConfirmationMode] =
    useState<PricingConfirmationMode | null>(null);
  const [confirmedEvent, setConfirmedEvent] =
    useState<PricingSuggestionAcceptedV1 | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [recoveryGuide, setRecoveryGuide] = useState<string | null>(null);
  const [authError, setAuthError] = useState<PriceConfirmationError | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "추천가를 확인하거나 수동 가격을 확정해 주세요."
  );
  const currentBasis = useMemo(
    () =>
      buildPricingSuggestionBasis({
        title,
        category,
        keySpecificationsText
      }),
    [category, keySpecificationsText, title]
  );
  const nextSuggestion = useMemo(
    () => buildPricingSuggestion(currentBasis),
    [currentBasis]
  );
  const isStale =
    Boolean(suggestion) &&
    suggestion?.basis.basisRevision !== currentBasis.basisRevision;
  const visibleError = validationError ?? fieldError ?? null;

  useEffect(() => {
    if (suggestion || !nextSuggestion) {
      return undefined;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        setSuggestion(nextSuggestion);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [nextSuggestion, suggestion]);

  function clearErrors() {
    setValidationError(null);
    setRecoveryGuide(null);
    setAuthError(null);
  }

  function buildConfirmationEvent(input: {
    confirmedPriceKrw: number;
    mode: PricingConfirmationMode;
  }): PricingSuggestionAcceptedV1 | null {
    if (!suggestion) {
      return null;
    }

    const confirmationError = readTestConfirmationError();

    if (confirmationError) {
      setAuthError(confirmationError);
      setStatusMessage("재인증 후 가격 확정을 다시 시도해 주세요.");
      return null;
    }

    return buildPricingSuggestionAcceptedV1({
      clientRequestId: `client-${suggestion.basis.basisRevision}`,
      idempotencyKey: `pricing-${suggestion.basis.basisRevision}`,
      traceId: `trace-${suggestion.basis.basisRevision}`,
      basisRevision: suggestion.basis.basisRevision,
      suggestedPriceKrw: suggestion.suggestedPriceKrw,
      confirmedPriceKrw: input.confirmedPriceKrw,
      mode: input.mode,
      manualReason: input.mode === "edited" ? manualReason.trim() : undefined
    });
  }

  function confirmPrice(input: {
    priceKrw: number;
    mode: PricingConfirmationMode;
  }) {
    const event = buildConfirmationEvent({
      confirmedPriceKrw: input.priceKrw,
      mode: input.mode
    });

    if (!event) {
      if (!suggestion && input.mode === "edited") {
        setConfirmedPrice(String(input.priceKrw));
        setConfirmationMode(input.mode);
        setConfirmedEvent(null);
        setStatusMessage("수동 가격을 최종 가격으로 확정했습니다.");
      }

      return;
    }

    setConfirmedPrice(String(input.priceKrw));
    setConfirmationMode(input.mode);
    setConfirmedEvent(event);
    setStatusMessage(
      input.mode === "accepted"
        ? "추천가를 최종 가격으로 확정했습니다."
        : "수동 수정 가격을 최종 가격으로 확정했습니다."
    );
  }

  function handleAcceptSuggestion() {
    clearErrors();

    if (!suggestion) {
      setValidationError("추천가를 먼저 확인해 주세요.");
      setRecoveryGuide("제목, 카테고리, 핵심 스펙을 입력한 뒤 다시 시도해 주세요.");
      return;
    }

    if (isStale) {
      setValidationError("상품 정보가 수정되어 추천가가 오래되었습니다.");
      setRecoveryGuide("현재 정보 기준으로 다시 확인해 주세요.");
      setStatusMessage("현재 상품 정보 기준의 추천가 재확인이 필요합니다.");
      return;
    }

    confirmPrice({
      priceKrw: suggestion.suggestedPriceKrw,
      mode: "accepted"
    });
  }

  function handleManualConfirm() {
    clearErrors();

    const validation = validatePriceInput(manualPrice);

    if (!validation.ok) {
      setValidationError(validation.message);
      setRecoveryGuide(validation.recoveryGuide);
      setStatusMessage("가격을 확정하려면 표시된 오류를 수정해 주세요.");
      return;
    }

    confirmPrice({
      priceKrw: validation.priceKrw,
      mode: "edited"
    });
  }

  function refreshSuggestion() {
    setSuggestion(nextSuggestion);
    setConfirmedEvent(null);
    setConfirmationMode(null);
    setStatusMessage("현재 정보 기준으로 추천가를 다시 확인했습니다.");
    clearErrors();
  }

  function clearAuthError() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("pricing-confirmation-error");
    }

    setAuthError(null);
    setStatusMessage("재인증 상태를 확인했습니다. 가격 확정을 다시 시도해 주세요.");
  }

  return (
    <Card
      variant="outlined"
      data-testid="price-suggestion-card"
      sx={{ borderRadius: 1 }}
    >
      <CardContent>
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
                추천가 확인
              </Typography>
              <Typography color="text.secondary" variant="body2">
                수용 또는 수동 수정 확정 전까지 최종 가격에는 반영되지 않습니다.
              </Typography>
            </Stack>
            <Chip
              label={`최대 ${formatKrw(pricingPolicy.maxPriceKrw)}`}
              variant="outlined"
              color="info"
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          {authError ? (
            <Alert role="alert" severity="warning" aria-live="assertive">
              <Stack spacing={1}>
                <Typography variant="body2">{authError.message}</Typography>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  onClick={clearAuthError}
                  sx={{ alignSelf: "flex-start", minHeight: 44 }}
                >
                  재인증 후 계속
                </Button>
              </Stack>
            </Alert>
          ) : null}

          {visibleError ? (
            <Alert role="alert" severity="error" aria-live="assertive">
              <Stack spacing={0.5}>
                <Typography variant="body2">{visibleError}</Typography>
                {recoveryGuide ? (
                  <Typography variant="body2">{recoveryGuide}</Typography>
                ) : null}
              </Stack>
            </Alert>
          ) : null}

          {isStale ? (
            <Alert
              severity="warning"
              data-testid="price-suggestion-stale-alert"
              aria-live="polite"
            >
              상품 정보가 수정되어 추천가가 오래되었습니다. 현재 정보 기준으로
              다시 확인해 주세요.
            </Alert>
          ) : null}

          {suggestion ? (
            <Box
              sx={{
                border: "1px solid rgba(11, 110, 153, 0.16)",
                p: 2
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography color="text.secondary" variant="body2">
                    추천가
                  </Typography>
                  <Typography
                    data-testid="price-suggestion-amount"
                    component="strong"
                    variant="h5"
                  >
                    {formatKrw(suggestion.suggestedPriceKrw)}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {suggestion.rationale} 범위 {formatKrw(suggestion.minPriceKrw)}-
                  {formatKrw(suggestion.maxPriceKrw)}
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ alignItems: { xs: "stretch", sm: "center" } }}
                >
                  <Button
                    type="button"
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={handleAcceptSuggestion}
                    data-testid="price-suggestion-accept-button"
                    sx={{ minHeight: 44 }}
                  >
                    추천가 수용
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={refreshSuggestion}
                    sx={{ minHeight: 44 }}
                  >
                    현재 정보 기준으로 다시 확인
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ) : (
            <Alert severity="info">
              추천가 근거가 부족합니다. 수동 가격을 입력해 확정할 수 있습니다.
            </Alert>
          )}

          <TextField
            label="수동 가격 (원)"
            value={manualPrice}
            onChange={(event) => {
              setManualPrice(event.target.value);
              setConfirmedEvent(null);
              setConfirmationMode(null);
            }}
            error={Boolean(validationError)}
            helperText={
              validationError
                ? recoveryGuide
                : "쉼표 없이 숫자만 입력해 주세요. 권장 단위는 1,000원입니다."
            }
            fullWidth
            autoComplete="off"
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                "aria-invalid": Boolean(validationError)
              }
            }}
          />

          <TextField
            label="수정 사유"
            value={manualReason}
            onChange={(event) => setManualReason(event.target.value)}
            helperText="수동 수정이 필요한 이유를 남길 수 있습니다."
            fullWidth
            autoComplete="off"
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
          >
            <Button
              type="button"
              variant="outlined"
              startIcon={<CheckIcon />}
              onClick={handleManualConfirm}
              sx={{ minHeight: 44 }}
            >
              수동 가격 확정
            </Button>
          </Stack>

          <TextField
            name="priceKrw"
            label="가격 (원)"
            value={confirmedPrice}
            error={Boolean(fieldError)}
            helperText={
              fieldError ??
              "추천가 수용 또는 수동 가격 확정을 선택하면 제출 가격이 정해집니다."
            }
            fullWidth
            slotProps={{
              htmlInput: {
                readOnly: true,
                inputMode: "numeric"
              }
            }}
          />

          {confirmedEvent ? (
            <>
              <Typography
                data-testid="price-confirmation-mode"
                variant="body2"
                color="text.secondary"
              >
                {confirmationMode}
              </Typography>
              <Typography
                data-testid="price-confirmed-event-id"
                variant="body2"
                color="text.secondary"
              >
                {confirmedEvent.eventId}
              </Typography>
            </>
          ) : null}

          <Typography
            role="status"
            aria-live="polite"
            aria-atomic="true"
            variant="body2"
            color={visibleError ? "error.main" : "text.secondary"}
          >
            {statusMessage}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
