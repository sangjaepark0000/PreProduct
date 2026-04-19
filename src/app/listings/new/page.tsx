import { redirect } from "next/navigation";

import { createListing } from "@/domain/listing/listing.service";
import {
  handleCreateListingSubmission,
  type CreateListingFormState
} from "@/feature/listing/actions/create-listing.action";
import { ListingForm } from "@/feature/listing/components/listing-form.client";
import { getListingRepository } from "@/infra/listing/listing.repository";

export default function NewListingPage() {
  async function createListingFormAction(
    previousState: CreateListingFormState,
    formData: FormData
  ): Promise<CreateListingFormState> {
    "use server";

    const result = await handleCreateListingSubmission(
      {
        createListing: async (input) =>
          createListing(
            {
              listingRepository: getListingRepository()
            },
            input
          )
      },
      previousState,
      formData
    );

    if (result.status === "success") {
      redirect(`/listings/${result.listingId}`);
    }

    return result;
  }

  return <ListingForm action={createListingFormAction} />;
}
