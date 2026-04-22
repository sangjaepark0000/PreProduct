"use client";

import { useActionState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  type SaveAutoAdjustRuleFormState
} from "@/feature/listing/actions/save-auto-adjust-rule.action";

type AutoAdjustRuleSelectorProps = {
  action: (
    previousState: SaveAutoAdjustRuleFormState,
    formData: FormData
  ) => Promise<SaveAutoAdjustRuleFormState>;
  initialState: SaveAutoAdjustRuleFormState;
};

const numericSlotProps = {
  htmlInput: {
    inputMode: "numeric",
    pattern: "[0-9]*"
  }
} as const;

export function AutoAdjustRuleSelector({
  action,
  initialState
}: AutoAdjustRuleSelectorProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formResetKey = JSON.stringify({
    submissionStatus: state.submissionStatus,
    values: state.values,
    activeSummary: state.activeRule?.summary ?? ""
  });

  const statusMessage =
    state.submissionStatus === "success"
      ? `규칙이 저장되었습니다. 현재 활성 규칙: ${state.activeRule?.summary ?? "없음"}`
      : `현재 활성 규칙: ${state.activeRule?.summary ?? "없음"}`;

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid rgba(11, 110, 153, 0.12)",
        p: { xs: 2, md: 4 }
      }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={1}>
          <Typography
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-testid="auto-adjust-rule-save-status"
            color="text.secondary"
          >
            {statusMessage}
          </Typography>

          <Box
            data-testid="auto-adjust-rule-active-summary"
            sx={{
              border: "1px solid rgba(11, 110, 153, 0.16)",
              p: 2
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
            >
              <Stack spacing={0.5}>
                <Typography variant="overline">활성 규칙</Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {state.activeRule?.summary ?? "아직 설정된 규칙이 없습니다."}
                </Typography>
              </Stack>
              <Chip
                label={state.activeRule?.enabled ? "활성" : "미설정"}
                color={state.activeRule?.enabled ? "primary" : "default"}
                sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
              />
            </Stack>
          </Box>
        </Stack>

        {state.formError ? (
          <Alert severity="error" aria-live="assertive" aria-atomic="true">
            <AlertTitle>{state.formError}</AlertTitle>
            {state.recoveryGuide ? (
              <Typography variant="body2">{state.recoveryGuide}</Typography>
            ) : null}
            {state.errorFieldLabels.length > 0 ? (
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ flexWrap: "wrap", mt: 1 }}
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
          </Alert>
        ) : null}

        <Box
          key={formResetKey}
          component="form"
          action={formAction}
          data-testid="auto-adjust-rule-form"
          noValidate
        >
          <Stack spacing={2}>
            <TextField
              name="periodDays"
              label="주기(일)"
              defaultValue={state.values.periodDays}
              error={Boolean(state.fieldErrors.periodDays)}
              helperText={
                state.fieldErrors.periodDays ??
                "자동 가격조정을 실행할 일 단위 주기를 입력해 주세요."
              }
              disabled={pending}
              fullWidth
              autoComplete="off"
              slotProps={numericSlotProps}
            />

            <TextField
              name="discountRatePercent"
              label="인하율(%)"
              defaultValue={state.values.discountRatePercent}
              error={Boolean(state.fieldErrors.discountRatePercent)}
              helperText={
                state.fieldErrors.discountRatePercent ??
                "한 번 실행될 때 인하할 정수 퍼센트를 입력해 주세요."
              }
              disabled={pending}
              fullWidth
              autoComplete="off"
              slotProps={numericSlotProps}
            />

            <TextField
              name="floorPriceKrw"
              label="최저가 하한 (원)"
              defaultValue={state.values.floorPriceKrw}
              error={Boolean(state.fieldErrors.floorPriceKrw)}
              helperText={
                state.fieldErrors.floorPriceKrw ??
                "현재 가격보다 낮은 원화 금액을 1,000원 단위로 입력해 주세요."
              }
              disabled={pending}
              fullWidth
              autoComplete="off"
              slotProps={numericSlotProps}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={pending}
              aria-busy={pending}
              sx={{ alignSelf: "flex-start", minHeight: 48, minWidth: 148 }}
            >
              {pending ? "저장 중..." : "규칙 저장"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
