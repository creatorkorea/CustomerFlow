"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/session";
import type { TagActionState } from "@/server/tags/action-state";
import { createTag } from "@/server/tags/service";
import { createTagSchema } from "@/server/tags/validation";

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createTagAction(
  _previousState: TagActionState,
  formData: FormData
): Promise<TagActionState> {
  const user = await requireUser();
  const parsed = createTagSchema.safeParse(formDataToObject(formData));

  if (!parsed.success || !user.organizationId) {
    return {
      status: "error",
      message: "태그 정보를 확인해주세요."
    };
  }

  await createTag({
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id),
    input: parsed.data
  });

  redirect("/tags");
}
