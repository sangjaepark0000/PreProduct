import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

import { listingIdSchema } from "@/domain/listing/listing";
import { getListingById } from "@/domain/listing/listing.service";
import {
  createInitialSaveAutoAdjustRuleFormState,
  getActiveAutoAdjustRuleForListing,
  handleSaveAutoAdjustRuleSubmission,
  saveActiveAutoAdjustRuleForListing,
  type SaveAutoAdjustRuleFormState
} from "@/feature/listing/actions/save-auto-adjust-rule.action";
import { AutoAdjustRuleSelector } from "@/feature/listing/components/auto-adjust-rule-selector.client";
import { getListingRepository } from "@/infra/listing/listing.repository";

type AutoAdjustRulePageProps = {
  params: Promise<{
    listingId: string;
  }>;
};

export default async function AutoAdjustRulePage({
  params
}: AutoAdjustRulePageProps) {
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
  const activeRule = await getActiveAutoAdjustRuleForListing(resolvedListing.id);
  const initialState = createInitialSaveAutoAdjustRuleFormState(activeRule);

  async function saveAutoAdjustRuleFormAction(
    previousState: SaveAutoAdjustRuleFormState,
    formData: FormData
  ): Promise<SaveAutoAdjustRuleFormState> {
    "use server";

    const result = await handleSaveAutoAdjustRuleSubmission(
      {
        saveAutoAdjustRule: saveActiveAutoAdjustRuleForListing
      },
      resolvedListing.id,
      resolvedListing.priceKrw,
      previousState,
      formData
    );

    if (result.submissionStatus === "success") {
      revalidatePath(`/listings/${resolvedListing.id}`);
      revalidatePath(`/listings/${resolvedListing.id}/auto-adjust-rule`);
    }

    return result;
  }

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="sm">
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography component="h1" variant="h2">
              자동 가격조정 규칙
            </Typography>
            <Typography color="text.secondary">
              {resolvedListing.title}의 가격조정 주기, 인하율, 최저가 하한을
              설정합니다.
            </Typography>
          </Stack>

          <AutoAdjustRuleSelector
            action={saveAutoAdjustRuleFormAction}
            initialState={initialState}
          />

          <Button
            href={`/listings/${resolvedListing.id}`}
            variant="outlined"
            sx={{ alignSelf: "flex-start", minHeight: 44 }}
          >
            매물 상세로 돌아가기
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
