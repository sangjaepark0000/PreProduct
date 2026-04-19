import { faker } from "@faker-js/faker";

export type TestRole = "seller" | "operator" | "guest";

export type TestAuthToken = {
  role: TestRole;
  token: string;
  userId: string;
};

export function createAuthToken(role: TestRole = "seller"): TestAuthToken {
  const userId = faker.string.uuid();
  const claims = Buffer.from(
    JSON.stringify({
      sub: userId,
      role
    })
  ).toString("base64url");

  return {
    role,
    token: `test.${claims}.signature`,
    userId
  };
}
