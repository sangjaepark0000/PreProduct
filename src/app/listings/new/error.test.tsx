import { renderToStaticMarkup } from "react-dom/server";

import NewListingErrorPage from "@/app/listings/new/error";

describe("NewListingErrorPage", () => {
  it("shows a generic retry message without leaking internal error details", () => {
    const markup = renderToStaticMarkup(
      <NewListingErrorPage
        error={
          new Error("DATABASE_URL is missing") as Error & {
            digest?: string;
          }
        }
        reset={() => undefined}
      />
    );

    expect(markup).toContain("등록 화면을 불러오는 중 문제가 발생했습니다.");
    expect(markup).toContain("잠시 후 다시 시도해 주세요.");
    expect(markup).toContain("다시 시도");
    expect(markup).not.toContain("DATABASE_URL is missing");
  });
});
