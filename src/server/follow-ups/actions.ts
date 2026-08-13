"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/session";
import type { FollowUpActionState } from "@/server/follow-ups/action-state";
import { createFollowUp, updateFollowUpStatus } from "@/server/follow-ups/service";
import {
  createFollowUpSchema,
  updateFollowUpStatusSchema
} from "@/server/follow-ups/validation";

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function normalizeKstDateTimeLocal(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00+09:00`;
  }

  return value;
}

export async function createFollowUpAction(
  _previousState: FollowUpActionState,
  formData: FormData
): Promise<FollowUpActionState> {
  const user = await requireUser();
  const payload = formDataToObject(formData);
  const parsed = createFollowUpSchema.safeParse({
    ...payload,
    dueAt: normalizeKstDateTimeLocal(payload.dueAt)
  });

  if (!parsed.success || !user.organizationId) {
    return {
      status: "error",
      message: "후속관리 정보를 확인해주세요."
    };
  }

  const followUp = await createFollowUp({
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id),
    input: parsed.data
  });

  redirect(`/follow-ups?customerId=${followUp.customerId}`);
}

export async function updateFollowUpStatusAction(formData: FormData) {
  const user = await requireUser();
  const followUpId = formData.get("followUpId");
  const parsed = updateFollowUpStatusSchema.safeParse({
    status: formData.get("status")
  });

  if (!parsed.success || !user.organizationId || typeof followUpId !== "string") {
    return;
  }

  await updateFollowUpStatus({
    followUpId: BigInt(followUpId),
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id),
    input: parsed.data
  });

  revalidatePath("/follow-ups");
}
