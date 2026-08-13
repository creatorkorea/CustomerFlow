import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters."),
  NEXTAUTH_URL: z.string().url()
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(source);
}

export function getEnvIssueMessages(source: NodeJS.ProcessEnv = process.env) {
  const result = envSchema.safeParse(source);

  if (result.success) {
    return [];
  }

  return result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
}
