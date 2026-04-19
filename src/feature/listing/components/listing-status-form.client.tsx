"use client";

import { useActionState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography
} from "@mui/material";

import {
  createInitialUpdateListingStatusFormState,
  type UpdateListingStatusFormState
} from "@/feature/listing/actions/update-listing-status.action";
import { prelistingStatusValues } from "@/domain/prelisting-status/prelisting-status";

type ListingStatusFormProps = {
  action: (
    previousState: UpdateListingStatusFormState,
    formData: FormData
  ) => Promise<UpdateListingStatusFormState>;
  currentStatus: string;
  updatedAt: string;
};

export function ListingStatusForm({
  action,
  currentStatus,
  updatedAt
}: ListingStatusFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    createInitialUpdateListingStatusFormState({
      currentStatus,
      updatedAt
    })
  );
  const formResetKey = JSON.stringify({
    currentStatus: state.currentStatus,
    updatedAt: state.updatedAt,
    selectedStatus: state.values.status
  });

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid rgba(11, 110, 153, 0.12)",
        p: { xs: 2, md: 4 }
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
        >
          <Stack spacing={0.75}>
            <Typography variant="overline">현재 상태</Typography>
            <Chip
              label={state.currentStatus}
              color={state.currentStatus === "판매중" ? "primary" : "default"}
              data-testid="listing-detail-status"
              sx={{ alignSelf: "flex-start", fontWeight: 700 }}
            />
          </Stack>
          <Stack spacing={0.5} sx={{ color: "text.secondary" }}>
            <Typography variant="overline">수정 시각</Typography>
            <Typography data-testid="listing-detail-updated-at">
              {state.updatedAt}
            </Typography>
          </Stack>
        </Stack>

        {state.formError ? (
          <Alert severity="error" aria-live="polite" aria-atomic="true">
            {state.formError}
          </Alert>
        ) : null}

        <Box
          key={formResetKey}
          component="form"
          action={formAction}
          noValidate
          sx={{ display: "block" }}
        >
          <Stack spacing={2}>
            <FormControl error={Boolean(state.fieldErrors.status)}>
              <FormLabel id="listing-detail-status-label">상태 변경</FormLabel>
              <RadioGroup
                row
                aria-labelledby="listing-detail-status-label"
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

            <Button
              type="submit"
              variant="contained"
              disabled={pending}
              sx={{ alignSelf: "flex-start", minWidth: 132 }}
            >
              상태 저장
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
