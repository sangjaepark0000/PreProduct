import { readEnv } from "@/shared/config/env";

describe("readEnv", () => {
  it("returns defaults for optional runtime values", () => {
    expect(
      readEnv({
        BASE_URL: "http://127.0.0.1:3000",
        API_URL: "http://127.0.0.1:3000/api"
      })
    ).toMatchObject({
      NODE_ENV: "development",
      TEST_ENV: "local"
    });
  });

  it("throws on invalid URLs", () => {
    expect.assertions(1);

    expect(() =>
      readEnv({
        BASE_URL: "not-a-url",
        API_URL: "http://127.0.0.1:3000/api"
      })
    ).toThrow();
  });
});
