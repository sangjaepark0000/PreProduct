import { expect, test } from "../support/fixtures/index.js";

test.describe("Framework smoke", () => {
  test("renders deterministic UI from fixture data", async ({
    page,
    createListingDraft,
    mockJsonRoute,
    mountTestDocument
  }) => {
    const draft = createListingDraft({
      title: "AI Draft Fixture",
      priceKrw: 58_000,
      category: "smartphone"
    });

    await mockJsonRoute({
      url: "https://fixture.test/api/listings/draft",
      method: "GET",
      headers: {
        "access-control-allow-origin": "*"
      },
      body: {
        data: draft
      }
    });

    await mountTestDocument(`
      <main>
        <h1 data-testid="listing-title">loading</h1>
        <p data-testid="listing-price">loading</p>
        <button data-testid="load-draft-button">Load draft</button>
        <script>
          const button = document.querySelector('[data-testid="load-draft-button"]');
          button?.addEventListener('click', async () => {
            const response = await fetch('https://fixture.test/api/listings/draft');
            const payload = await response.json();
            document.querySelector('[data-testid="listing-title"]').textContent = payload.data.title;
            document.querySelector('[data-testid="listing-price"]').textContent = String(payload.data.priceKrw);
          });
        </script>
      </main>
    `);

    await page.getByTestId("load-draft-button").click();

    await expect(page.getByTestId("listing-title")).toHaveText(draft.title);
    await expect(page.getByTestId("listing-price")).toHaveText("58000");
  });
});
