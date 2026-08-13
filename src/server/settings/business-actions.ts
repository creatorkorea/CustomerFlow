"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/server/auth/session";
import type { BusinessSettingsActionState } from "@/server/settings/business-action-state";
import {
  assertCanManageBusinessSettings,
  updateBusinessSettings
} from "@/server/settings/business-service";
import { updateBusinessSettingsSchema } from "@/server/settings/business-validation";
import { AppError } from "@/server/shared/http-errors";

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function updateBusinessSettingsAction(
  _previousState: BusinessSettingsActionState,
  formData: FormData
): Promise<BusinessSettingsActionState> {
  try {
    const user = await requireUser();
    const parsed = updateBusinessSettingsSchema.safeParse(
      formDataToObject(formData)
    );

    if (!parsed.success || !user.organizationId) {
      return {
        status: "error",
        message: "사업장 정보를 확인해주세요."
      };
    }

    assertCanManageBusinessSettings(user.role);

    await updateBusinessSettings({
      organizationId: BigInt(user.organizationId),
      userId: BigInt(user.id),
      input: parsed.data
    });

    revalidatePath("/settings/business");

    return {
      status: "success",
      message: "사업장 설정을 저장했습니다."
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        status: "error",
        message: error.message
      };
    }

    throw error;
  }
}
