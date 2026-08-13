import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const followUpStatusSchema = z.enum([
  "pending",
  "completed",
  "cancelled"
]);

export const createFollowUpSchema = z.object({
  customerId: z.string().trim().regex(/^\d+$/),
  consultationId: z
    .string()
    .trim()
    .regex(/^\d+$/)
    .or(z.literal("").transform(() => undefined))
    .optional(),
  title: z.string().trim().min(1).max(200),
  memo: optionalText,
  dueAt: z.string().trim().datetime({ offset: true }),
  status: followUpStatusSchema.default("pending")
});

export const updateFollowUpStatusSchema = z.object({
  status: followUpStatusSchema
});

export const listFollowUpsSchema = z.object({
  customerId: z.string().trim().regex(/^\d+$/).optional(),
  status: followUpStatusSchema.optional(),
  from: z.string().trim().datetime({ offset: true }).optional(),
  to: z.string().trim().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
export type UpdateFollowUpStatusInput = z.infer<
  typeof updateFollowUpStatusSchema
>;
export type ListFollowUpsInput = z.infer<typeof listFollowUpsSchema>;
