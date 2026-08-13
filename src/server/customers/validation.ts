import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const customerStatusSchema = z.enum([
  "new",
  "consulting",
  "reserved",
  "completed",
  "dormant",
  "cancelled"
]);

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: optionalText,
  email: z
    .string()
    .trim()
    .email()
    .or(z.literal("").transform(() => undefined))
    .optional(),
  address: optionalText,
  status: customerStatusSchema.default("new"),
  memo: optionalText,
  tagIds: z.array(z.string().trim().regex(/^\d+$/)).default([])
});

export const updateCustomerSchema = createCustomerSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "수정할 고객 정보가 필요합니다."
);

export const listCustomersSchema = z.object({
  search: optionalText,
  status: customerStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ListCustomersInput = z.infer<typeof listCustomersSchema>;
