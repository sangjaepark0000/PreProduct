import { notFound } from "next/navigation";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

import { listingIdSchema } from "@/domain/listing/listing";
import { getListingById } from "@/domain/listing/listing.service";
import { PriceChangeHistoryList } from "@/feature/pricing/components/price-change-history-list.client";
import { getListingRepository } from "@/infra/listing/listing.repository";
import { getPriceChangeHistoryRepository } from "@/infra/pricing/price-change-history.repository";

type PriceChangeHistoryPageProps = {
  params: Promise<{
    listingId: string;
  }>;
};

export default async function PriceChangeHistoryPage({
  params
}: PriceChangeHistoryPageProps) {
  const parsedParams = listingIdSchema.safeParse((await params).listingId);

  if (!parsedParams.success) {
    notFound();
  }

  const listing = await getListingById(
    {
      listingRepository: getListingRepository()
    },
    parsedParams.data
  );

  if (!listing) {
    notFound();
  }

  const rows = await getPriceChangeHistoryRepository().listForListing(
    parsedParams.data
  );

  return (
    <Box
      data-testid="price-change-history-page"
      sx={{ py: { xs: 4, md: 8 } }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Stack spacing={1}>
              <Typography component="h1" variant="h2">
                가격 변경 이력
              </Typography>
              <Typography color="text.secondary">
                {listing.title}의 자동 가격조정 적용 결과입니다.
              </Typography>
            </Stack>
            <Button
              href={`/listings/${listing.id}`}
              variant="outlined"
              sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
            >
              매물 상세로 돌아가기
            </Button>
          </Stack>

          <PriceChangeHistoryList rows={rows} />
        </Stack>
      </Container>
    </Box>
  );
}
