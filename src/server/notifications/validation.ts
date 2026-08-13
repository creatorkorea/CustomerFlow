import { z } from "zod";

const queryBooleanSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .or(z.boolean());

export const listNotificationsSchema = z.object({
  unreadOnly: queryBooleanSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const markNotificationReadSchema = z.object({
  notificationId: z.string().trim().regex(/^\d+$/)
});

export const markNotificationsReadSchema = z
  .object({
    notificationId: z.string().trim().regex(/^\d+$/).optional(),
    all: z.boolean().optional()
  })
  .refine((value) => value.all === true || Boolean(value.notificationId), {
    message: "notificationId 또는 all이 필요합니다."
  });

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;
export type MarkNotificationReadInput = z.infer<
  typeof markNotificationReadSchema
>;
