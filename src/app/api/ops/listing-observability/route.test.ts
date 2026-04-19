import { GET } from "@/app/api/ops/listing-observability/route";
import { getListingObservabilityReport } from "@/domain/observability/listing-observability.service";
import { getListingRepository } from "@/infra/listing/listing.repository";

jest.mock("@/domain/observability/listing-observability.service", () => ({
  getListingObservabilityReport: jest.fn()
}));

jest.mock("@/infra/listing/listing.repository", () => ({
  getListingRepository: jest.fn(() => ({ mocked: true }))
}));

describe("listing observability route", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns a JSON summary by default", async () => {
    (getListingObservabilityReport as jest.Mock).mockResolvedValueOnce({
      summary: {
        totalListings: 1,
        initialStatusDistribution: {
          판매중: 1,
          프리리스팅: 0
        },
        updatedWithin7DaysCount: 0
      },
      createdRecords: []
    });

    const response = await GET(new Request("http://localhost/api/ops/listing-observability"));

    expect(getListingRepository).toHaveBeenCalledTimes(1);
    expect(getListingObservabilityReport).toHaveBeenCalledWith({
      listingRepository: {
        mocked: true
      }
    });
    await expect(response.json()).resolves.toEqual({
      summary: {
        totalListings: 1,
        initialStatusDistribution: {
          판매중: 1,
          프리리스팅: 0
        },
        updatedWithin7DaysCount: 0
      },
      createdRecords: []
    });
  });

  it("returns a CSV export when requested", async () => {
    (getListingObservabilityReport as jest.Mock).mockResolvedValueOnce({
      summary: {
        totalListings: 1,
        initialStatusDistribution: {
          판매중: 1,
          프리리스팅: 0
        },
        updatedWithin7DaysCount: 0
      },
      createdRecords: [
        {
          eventId: "916df0fd-cc73-48cb-84e9-837c9748c968",
          occurredAt: "2026-04-19T00:00:00.000Z",
          traceId: "listing-916df0fd-cc73-48cb-84e9-837c9748c968",
          schemaVersion: "1.0.0",
          payload: {
            listingId: "916df0fd-cc73-48cb-84e9-837c9748c968",
            initialStatus: "판매중"
          }
        }
      ]
    });

    const response = await GET(
      new Request("http://localhost/api/ops/listing-observability?format=csv")
    );

    expect(response.headers.get("content-type")).toContain("text/csv");
    await expect(response.text()).resolves.toContain(
      "916df0fd-cc73-48cb-84e9-837c9748c968,2026-04-19T00:00:00.000Z,판매중"
    );
  });
});
