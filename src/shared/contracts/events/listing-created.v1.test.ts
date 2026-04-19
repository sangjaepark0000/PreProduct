import { listingCreatedV1Schema } from "@/shared/contracts/events/listing-created.v1";

describe("listingCreatedV1Schema", () => {
  it("accepts the canonical event fields", () => {
    const event = {
      eventId: "3dc16f52-7431-41f6-8b6d-8b298cc7bc5a",
      occurredAt: "2026-04-18T09:00:00.000Z",
      traceId: "trace-1-0-story",
      schemaVersion: "1.0.0",
      payload: {
        listingId: "0f5ce5d8-e04b-4e13-9f0d-f550ca3a1cb5",
        initialStatus: "draft"
      }
    };

    expect(listingCreatedV1Schema.parse(event)).toEqual(event);
  });

  it("rejects missing payload status", () => {
    expect(() =>
      listingCreatedV1Schema.parse({
        eventId: "3dc16f52-7431-41f6-8b6d-8b298cc7bc5a",
        occurredAt: "2026-04-18T09:00:00.000Z",
        traceId: "trace-1-0-story",
        schemaVersion: "1.0.0",
        payload: {
          listingId: "0f5ce5d8-e04b-4e13-9f0d-f550ca3a1cb5"
        }
      })
    ).toThrow();
  });
});
