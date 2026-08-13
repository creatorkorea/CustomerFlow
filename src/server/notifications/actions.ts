"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/server/auth/session";
import {
  markAllNotificationsRead,
  markNotificationRead
} from "@/server/notifications/service";
import { markNotificationReadSchema } from "@/server/notifications/validation";

function getTenantUser(user: Awaited<ReturnType<typeof requireUser>>) {
  if (!user.organizationId) {
    throw new Error("사업장 권한을 확인할 수 없습니다.");
  }

  return {
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id)
  };
}

export async function markNotificationReadAction(formData: FormData) {
  const user = await requireUser();
  const parsed = markNotificationReadSchema.parse({
    notificationId: formData.get("notificationId")
  });

  await markNotificationRead({
    ...getTenantUser(user),
    notificationId: parsed.notificationId
  });
  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser();

  await markAllNotificationsRead(getTenantUser(user));
  revalidatePath("/notifications");
}
