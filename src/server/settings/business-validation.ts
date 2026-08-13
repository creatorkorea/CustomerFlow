import { z } from "zod";

const nullableText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

export const updateBusinessSettingsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  businessNumber: nullableText.pipe(
    z.string().max(30).nullable().optional()
  ),
  phone: nullableText.pipe(z.string().max(30).nullable().optional()),
  email: nullableText.pipe(z.string().email().max(255).nullable().optional()),
  timezone: z.string().trim().min(1).max(50).default("Asia/Seoul")
});

export type UpdateBusinessSettingsInput = z.infer<
  typeof updateBusinessSettingsSchema
>;
