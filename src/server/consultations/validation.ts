import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const consultationChannelSchema = z.enum([
  "phone",
  "sms",
  "kakao",
  "danggeun",
  "visit",
  "other"
]);

export const consultationTypeSchema = z.enum([
  "inquiry",
  "quote",
  "booking",
  "complaint",
  "returning",
  "other"
]);

export const consultationStatusSchema = z.enum([
  "new",
  "consulting",
  "quote",
  "reserved",
  "completed",
  "on_hold",
  "cancelled"
]);

export const createConsultationSchema = z.object({
  customerId: z.string().trim().regex(/^\d+$/),
  channel: consultationChannelSchema.default("phone"),
  type: consultationTypeSchema.default("inquiry"),
  status: consultationStatusSchema.default("new"),
  content: z.string().trim().min(1),
  result: optionalText,
  nextAction: optionalText,
  followUpAt: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(z.literal("").transform(() => undefined))
    .optional()
});

export const listConsultationsSchema = z.object({
  customerId: z.string().trim().regex(/^\d+$/).optional(),
  status: consultationStatusSchema.optional(),
  channel: consultationChannelSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export type CreateConsultationInput = z.infer<
  typeof createConsultationSchema
>;
export type ListConsultationsInput = z.infer<typeof listConsultationsSchema>;
