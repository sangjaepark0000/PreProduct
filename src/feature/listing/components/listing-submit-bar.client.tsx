"use client";

import { Button, Paper, Stack, Typography } from "@mui/material";

type ListingSubmitBarProps = {
  pending: boolean;
};

export function ListingSubmitBar({ pending }: ListingSubmitBarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: "sticky",
        bottom: 16,
        border: "1px solid rgba(11, 110, 153, 0.12)",
        px: 2,
        py: 1.5
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
      >
        <Typography color="text.secondary" variant="body2">
          핵심 스펙은 한 줄에 한 개씩 입력하면 됩니다.
        </Typography>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={pending}
          aria-busy={pending}
          sx={{ minHeight: 52, minWidth: { sm: 220 } }}
        >
          {pending ? "저장 중..." : "등록하고 상세 보기"}
        </Button>
      </Stack>
    </Paper>
  );
}
