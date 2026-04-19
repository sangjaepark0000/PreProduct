import { getListingObservabilityReport } from "@/domain/observability/listing-observability.service";
import { getListingRepository } from "@/infra/listing/listing.repository";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const report = await getListingObservabilityReport({
    listingRepository: getListingRepository()
  });

  if (format === "csv") {
    const header = "listingId,occurredAt,initialStatus\n";
    const rows = report.createdRecords
      .map((record) =>
        [
          record.payload.listingId,
          record.occurredAt,
          record.payload.initialStatus
        ].join(",")
      )
      .join("\n");

    return new Response(`${header}${rows}\n`, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="listing-observability.csv"'
      }
    });
  }

  return Response.json(report);
}
