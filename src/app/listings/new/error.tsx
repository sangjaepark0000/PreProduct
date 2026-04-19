"use client";

import { Alert, Button, Container, Paper, Stack } from "@mui/material";

type NewListingErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function NewListingErrorPage({
  reset
}: NewListingErrorPageProps) {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper elevation={0} sx={{ border: "1px solid rgba(11, 110, 153, 0.12)", p: 3 }}>
        <Stack spacing={2}>
          <Alert severity="error">
            등록 화면을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해
            주세요.
          </Alert>
          <Button variant="contained" onClick={() => reset()}>
            다시 시도
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
