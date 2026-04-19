"use client";

import { useActionState } from "react";
import {
  Alert,
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  initialCreateListingFormState,
  type CreateListingFormState
} from "@/feature/listing/actions/create-listing.action";
import { ListingSubmitBar } from "@/feature/listing/components/listing-submit-bar.client";

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
              label="Story 1.1 기본 등록"
              color="secondary"
              sx={{ alignSelf: "flex-start", fontWeight: 700 }}
            />
            <Typography component="h1" variant="h2">
              설명 없이 바로 시작되는 중고 매물 등록
            </Typography>
            <Typography color="text.secondary" variant="body1">
              제목, 카테고리, 핵심 스펙, 가격만 입력하면 저장 후 바로 상세 화면으로
              이동합니다.
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
                  {state.formError}
                </Alert>
              ) : null}

              <TextField
                name="title"
                label="제목"
                defaultValue={state.values.title}
                error={Boolean(state.fieldErrors.title)}
                helperText={state.fieldErrors.title ?? "예: 맥북 에어 M3 13인치"}
                fullWidth
                autoComplete="off"
                slotProps={{ htmlInput: { maxLength: 120 } }}
              />

              <TextField
                name="category"
                label="카테고리"
                defaultValue={state.values.category}
                error={Boolean(state.fieldErrors.category)}
                helperText={state.fieldErrors.category ?? "예: 노트북, 카메라, 게임기"}
                fullWidth
                autoComplete="off"
                slotProps={{ htmlInput: { maxLength: 60 } }}
              />

              <TextField
                name="keySpecificationsText"
                label="핵심 스펙"
                defaultValue={state.values.keySpecificationsText}
                error={Boolean(state.fieldErrors.keySpecificationsText)}
                helperText={
                  state.fieldErrors.keySpecificationsText ??
                  "한 줄에 한 개씩 입력해 주세요. 예: 16GB RAM"
                }
                fullWidth
                multiline
                minRows={4}
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
            </Stack>
          </Paper>

          <ListingSubmitBar pending={pending} />
        </Stack>
      </Container>
    </Box>
  );
}
