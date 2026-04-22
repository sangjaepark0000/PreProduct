import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";

import { listingIdSchema } from "@/domain/listing/listing";
import {
  getListingById,
  updateListingStatus
} from "@/domain/listing/listing.service";
import {
  handleUpdateListingStatusSubmission,
  type UpdateListingStatusFormState
} from "@/feature/listing/actions/update-listing-status.action";
import { getActiveAutoAdjustRuleForListing } from "@/feature/listing/actions/save-auto-adjust-rule.action";
import { ListingStatusForm } from "@/feature/listing/components/listing-status-form.client";
import { getListingRepository } from "@/infra/listing/listing.repository";

type ListingDetailPageProps = {
  params: Promise<{
    listingId: string;
  }>;
};

const priceFormatter = new Intl.NumberFormat("ko-KR");

function buildSpecificationItems(specifications: string[]): Array<{
  key: string;
  value: string;
}> {
  const seenCounts = new Map<string, number>();

  return specifications.map((specification) => {
    const occurrence = (seenCounts.get(specification) ?? 0) + 1;

    seenCounts.set(specification, occurrence);

    return {
      key: `${specification}-${occurrence}`,
      value: specification
    };
  });
}

export default async function ListingDetailPage({
  params
}: ListingDetailPageProps) {
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

  const resolvedListing = listing;
  const activeAutoAdjustRule = await getActiveAutoAdjustRuleForListing(
    resolvedListing.id
  );

  async function updateListingStatusFormAction(
    previousState: UpdateListingStatusFormState,
    formData: FormData
  ): Promise<UpdateListingStatusFormState> {
    "use server";

    const result = await handleUpdateListingStatusSubmission(
      {
        updateListingStatus: async (input) =>
          updateListingStatus(
            {
              listingRepository: getListingRepository()
            },
            input
          )
      },
      resolvedListing.id,
      previousState,
      formData
    );

    if (result.submissionStatus === "success") {
      revalidatePath(`/listings/${resolvedListing.id}`);
    }

    return result;
  }

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Stack spacing={1}>
              <Typography
                component="h1"
                variant="h2"
                data-testid="listing-detail-title"
              >
                {resolvedListing.title}
              </Typography>
              <Typography color="text.secondary">
                저장이 완료되었습니다. 같은 화면에서 다시 등록하려면 새 등록 버튼을
                사용하세요.
              </Typography>
            </Stack>
            <Button href="/listings/new" variant="outlined">
              새 매물 등록
            </Button>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              border: "1px solid rgba(11, 110, 153, 0.12)",
              p: { xs: 2, md: 4 }
            }}
          >
            <Stack spacing={2.5}>
              <ListingStatusForm
                action={updateListingStatusFormAction}
                currentStatus={resolvedListing.currentStatus}
                updatedAt={resolvedListing.updatedAt}
              />

              <Divider />

              <Stack spacing={0.75}>
                <Typography variant="overline">카테고리</Typography>
                <Typography data-testid="listing-detail-category">
                  {resolvedListing.category}
                </Typography>
              </Stack>

              <Divider />

              <Stack spacing={0.75}>
                <Typography variant="overline">가격</Typography>
                <Typography data-testid="listing-detail-price">
                  {priceFormatter.format(resolvedListing.priceKrw)}원
                </Typography>
              </Stack>

              <Divider />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
              >
                <Stack spacing={0.75}>
                  <Typography variant="overline">자동 가격조정</Typography>
                  <Typography data-testid="listing-detail-auto-adjust-rule">
                    {activeAutoAdjustRule
                      ? `${activeAutoAdjustRule.periodDays}일마다 ${activeAutoAdjustRule.discountRatePercent}% 인하, 최저 ${priceFormatter.format(
                          activeAutoAdjustRule.floorPriceKrw
                        )}원`
                      : "아직 설정된 규칙이 없습니다."}
                  </Typography>
                </Stack>
                <Button
                  href={`/listings/${resolvedListing.id}/auto-adjust-rule`}
                  variant="outlined"
                  sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                >
                  자동 가격조정 설정
                </Button>
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Typography variant="overline">핵심 스펙</Typography>
                <Stack component="ul" spacing={1} sx={{ m: 0, pl: 3 }}>
                  {buildSpecificationItems(resolvedListing.keySpecifications).map((item) => (
                    <Typography
                      key={item.key}
                      component="li"
                      data-testid="listing-detail-specification"
                    >
                      {item.value}
                    </Typography>
                  ))}
                </Stack>
              </Stack>

              <Divider />

              <Typography sx={{ color: "text.secondary" }}>
                생성: {resolvedListing.createdAt}
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
