import {
  getListingObservabilityReport
} from "@/domain/observability/listing-observability.service";

describe("listing observability service", () => {
  it("builds summary metrics and created records from persisted listings", async () => {
    const report = await getListingObservabilityReport({
      listingRepository: {
        listAll: async () => [
          {
            id: "916df0fd-cc73-48cb-84e9-837c9748c968",
            title: "맥북 프로 14",
            category: "노트북",
            keySpecifications: ["M4 Pro", "24GB RAM"],
            priceKrw: 2850000,
            initialStatus: "프리리스팅",
            currentStatus: "판매중",
            createdAt: "2026-04-19T00:00:00.000Z",
            updatedAt: "2026-04-22T00:00:00.000Z"
          },
          {
            id: "ef8cb604-d2e8-46fd-859c-a9c8187bbdca",
            title: "에어팟 맥스",
            category: "헤드폰",
            keySpecifications: ["USB-C"],
            priceKrw: 650000,
            initialStatus: "판매중",
            currentStatus: "판매중",
            createdAt: "2026-04-19T00:00:00.000Z",
            updatedAt: "2026-04-19T00:00:00.000Z"
          }
        ]
      }
    });

    expect(report.summary).toEqual({
      totalListings: 2,
      initialStatusDistribution: {
        판매중: 1,
        프리리스팅: 1
      },
      updatedWithin7DaysCount: 1
    });
    expect(report.createdRecords).toMatchObject([
      {
        eventId: "916df0fd-cc73-48cb-84e9-837c9748c968",
        payload: {
          listingId: "916df0fd-cc73-48cb-84e9-837c9748c968",
          initialStatus: "프리리스팅"
        }
      },
      {
        eventId: "ef8cb604-d2e8-46fd-859c-a9c8187bbdca",
        payload: {
          listingId: "ef8cb604-d2e8-46fd-859c-a9c8187bbdca",
          initialStatus: "판매중"
        }
      }
    ]);
  });
});
