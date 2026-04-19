"use client";

import BoltOutlined from "@mui/icons-material/BoltOutlined";
import LanOutlined from "@mui/icons-material/LanOutlined";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import {
  Box,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";

import { appShellBudget } from "@/domain/measurement/perf-budget";

const qualityGates = [
  {
    name: "lint",
    detail: "Next.js + TypeScript baseline rules"
  },
  {
    name: "typecheck",
    detail: "strict + noUncheckedIndexedAccess + noImplicitReturns"
  },
  {
    name: "unit",
    detail: "Jest baseline for domain and env logic"
  },
  {
    name: "contract",
    detail: "listing.created.v1 canonical event validation"
  },
  {
    name: "perf-budget",
    detail: "Production shell latency and payload thresholds"
  }
] as const;

export function ListingShell() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Chip
              label="Story 1.0 Baseline"
              color="secondary"
              sx={{ alignSelf: "flex-start", fontWeight: 700 }}
            />
            <Typography component="h1" variant="h1">
              Active MVP를 위한 루트 앱 셸과 차단형 품질 게이트
            </Typography>
            <Typography color="text.secondary" variant="h5">
              기존 Playwright 하네스를 유지한 채 루트 저장소를 Next.js App Router
              기준선으로 정렬했습니다.
            </Typography>
          </Stack>

          <Paper
            data-testid="app-shell"
            elevation={0}
            sx={{
              overflow: "hidden",
              border: "1px solid rgba(11, 110, 153, 0.12)",
              background:
                "linear-gradient(145deg, rgba(11,110,153,0.12), rgba(242,143,59,0.08))"
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              divider={<Divider flexItem orientation="vertical" />}
            >
              <Stack spacing={1.5} sx={{ flex: 1, p: 4 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <LanOutlined color="primary" />
                  <Typography variant="h5">앱 구조</Typography>
                </Stack>
                <Typography color="text.secondary">
                  `src/app`, `src/feature`, `src/domain`, `src/infra`,
                  `src/shared`, `prisma` 경계를 고정했습니다.
                </Typography>
              </Stack>

              <Stack spacing={1.5} sx={{ flex: 1, p: 4 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <VerifiedOutlined color="primary" />
                  <Typography variant="h5">차단 게이트</Typography>
                </Stack>
                <Stack spacing={1}>
                  {qualityGates.map((gate) => (
                    <Box
                      key={gate.name}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        alignItems: "baseline"
                      }}
                    >
                      <Typography sx={{ fontWeight: 700 }}>{gate.name}</Typography>
                      <Typography color="text.secondary">{gate.detail}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>

              <Stack spacing={1.5} sx={{ flex: 1, p: 4 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <BoltOutlined color="primary" />
                  <Typography variant="h5">성능 기준</Typography>
                </Stack>
                <Typography color="text.secondary">
                  응답 시작 {appShellBudget.responseStartMs}ms, DOMContentLoaded{" "}
                  {appShellBudget.domContentLoadedMs}ms, Load {appShellBudget.loadMs}
                  ms, HTML {appShellBudget.htmlTransferBytes}B, 요청{" "}
                  {appShellBudget.totalRequests}개 이하
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
