"use client";

import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

import { type PriceChangeHistoryRow } from "@/domain/pricing/price-change-history";

type PriceChangeHistoryListProps = {
  rows: PriceChangeHistoryRow[];
};

const priceFormatter = new Intl.NumberFormat("ko-KR");

function formatKrw(priceKrw: number): string {
  return `${priceFormatter.format(priceKrw)}원`;
}

function formatAppliedAt(appliedAt: string): string {
  return `${appliedAt.slice(0, 16).replace("T", " ")} UTC`;
}

export function PriceChangeHistoryList({
  rows
}: PriceChangeHistoryListProps) {
  if (rows.length === 0) {
    return (
      <Paper
        elevation={0}
        data-testid="price-change-history-empty-state"
        sx={{
          border: "1px solid rgba(11, 110, 153, 0.12)",
          p: { xs: 2, md: 3 }
        }}
      >
        <Stack spacing={0.75}>
          <Typography variant="h6">아직 가격 변경 이력이 없습니다.</Typography>
          <Typography color="text.secondary">
            자동 가격조정이 적용되면 변경 전후 가격과 사유가 여기에 표시됩니다.
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid rgba(11, 110, 153, 0.12)" }}
    >
      <Table aria-label="가격 변경 이력">
        <TableHead>
          <TableRow>
            <TableCell>변경 전</TableCell>
            <TableCell>변경 후</TableCell>
            <TableCell>변경 시각</TableCell>
            <TableCell>변경 사유</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={`${row.listingId}-${row.appliedAt}-${row.reasonCode}-${index}`}
              data-testid="price-change-history-row"
            >
              <TableCell data-testid="price-change-history-before-price">
                {formatKrw(row.beforePriceKrw)}
              </TableCell>
              <TableCell data-testid="price-change-history-after-price">
                {formatKrw(row.afterPriceKrw)}
              </TableCell>
              <TableCell data-testid="price-change-history-applied-at">
                {formatAppliedAt(row.appliedAt)}
              </TableCell>
              <TableCell data-testid="price-change-history-reason">
                {row.reasonCode}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
