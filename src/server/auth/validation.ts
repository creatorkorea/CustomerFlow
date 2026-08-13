import { z } from "zod";

const nullableBusinessNumber = z
  .string()
  .trim()
  .max(30)
  .optional()
  .transform((value) => (value ? value : null));

export const loginFormSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1)
});

export const registerFormSchema = z.object({
  organizationName: z.string().trim().min(1),
  businessNumber: nullableBusinessNumber,
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8)
});

export type LoginFormInput = z.infer<typeof loginFormSchema>;
export type RegisterFormInput = z.infer<typeof registerFormSchema>;

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
