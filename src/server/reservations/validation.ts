import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const reservationStatusSchema = z.enum([
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "no_show"
]);

export const createReservationSchema = z
  .object({
    customerId: z.string().trim().regex(/^\d+$/),
    title: z.string().trim().min(1).max(200),
    startAt: z.string().trim().datetime({ offset: true }),
    endAt: z.string().trim().datetime({ offset: true }),
    location: optionalText,
    memo: optionalText,
    status: reservationStatusSchema.default("scheduled")
  })
  .refine((value) => new Date(value.startAt) < new Date(value.endAt), {
    message: "예약 종료 시간은 시작 시간 이후여야 합니다.",
    path: ["endAt"]
  });

export const updateReservationStatusSchema = z.object({
  status: reservationStatusSchema
});

export const listReservationsSchema = z
  .object({
    customerId: z.string().trim().regex(/^\d+$/).optional(),
    status: reservationStatusSchema.optional(),
    from: z.string().trim().datetime({ offset: true }).optional(),
    to: z.string().trim().datetime({ offset: true }).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20)
  })
  .refine(
    (value) =>
      !value.from || !value.to || new Date(value.from) <= new Date(value.to),
    {
      message: "조회 종료일은 시작일 이후여야 합니다.",
      path: ["to"]
    }
  );

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusInput = z.infer<
  typeof updateReservationStatusSchema
>;
export type ListReservationsInput = z.infer<typeof listReservationsSchema>;
