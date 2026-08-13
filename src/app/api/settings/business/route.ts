import { requireUser } from "@/server/auth/session";
import {
  assertCanManageBusinessSettings,
  getBusinessSettings,
  updateBusinessSettings
} from "@/server/settings/business-service";
import { updateBusinessSettingsSchema } from "@/server/settings/business-validation";
import { failure, success } from "@/server/shared/api-response";
import { AppError, toApiError } from "@/server/shared/http-errors";

function requireTenantUser(user: Awaited<ReturnType<typeof requireUser>>) {
  if (!user.organizationId) {
    throw new AppError("FORBIDDEN", "사업장 권한을 확인할 수 없습니다.", 403);
  }

  return {
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id)
  };
}

export async function GET() {
  try {
    const user = await requireUser();
    const { organizationId } = requireTenantUser(user);
    const settings = await getBusinessSettings({
      organizationId
    });

    return success(settings);
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const tenantUser = requireTenantUser(user);
    const parsed = updateBusinessSettingsSchema.safeParse(await request.json());

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "사업장 정보를 확인해주세요.", 400);
    }

    assertCanManageBusinessSettings(user.role);

    const settings = await updateBusinessSettings({
      ...tenantUser,
      input: parsed.data
    });

    return success(settings);
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}
