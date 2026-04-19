"use client";

import { Alert, Box, Button, Stack, Typography } from "@mui/material";

type ErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 3
      }}
    >
      <Stack spacing={2} sx={{ maxWidth: 560 }}>
        <Alert severity="error">앱 셸 초기화 중 문제가 발생했습니다.</Alert>
        <Typography variant="h4">품질 게이트 확인이 필요합니다.</Typography>
        <Typography color="text.secondary">{error.message}</Typography>
        <Button variant="contained" onClick={reset}>
          다시 시도
        </Button>
      </Stack>
    </Box>
  );
}
