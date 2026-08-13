import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const tagColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .or(z.literal("").transform(() => undefined))
  .optional();

export const createTagSchema = z.object({
  name: z.string().trim().min(1).max(50),
  color: tagColorSchema.default("#0f766e")
});

export const listTagsSchema = z.object({
  search: optionalText,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50)
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type ListTagsInput = z.infer<typeof listTagsSchema>;
