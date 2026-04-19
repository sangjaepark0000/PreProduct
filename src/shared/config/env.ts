import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  TEST_ENV: z.string().default("local"),
  BASE_URL: z.url().default("http://127.0.0.1:3000"),
  API_URL: z.url().default("http://127.0.0.1:3000/api")
});

export type AppEnv = z.infer<typeof envSchema>;

type EnvSource = Record<string, string | undefined>;

export function readEnv(rawEnv: EnvSource = process.env): AppEnv {
  return envSchema.parse({
    NODE_ENV: rawEnv.NODE_ENV,
    TEST_ENV: rawEnv.TEST_ENV,
    BASE_URL: rawEnv.BASE_URL,
    API_URL: rawEnv.API_URL
  });
}

export const env = readEnv();
