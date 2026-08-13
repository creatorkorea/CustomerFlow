import { requireUser } from "@/server/auth/session";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "@/server/notifications/service";
import {
  listNotificationsSchema,
  markNotificationsReadSchema
} from "@/server/notifications/validation";
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

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const tenantUser = requireTenantUser(user);
    const url = new URL(request.url);
    const parsed = listNotificationsSchema.safeParse(
      Object.fromEntries(url.searchParams.entries())
    );

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "알림 검색 조건을 확인해주세요.", 400);
    }

    const data = await listNotifications({
      ...tenantUser,
      ...parsed.data
    });

    return success(data);
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const tenantUser = requireTenantUser(user);
    const parsed = markNotificationsReadSchema.safeParse(await request.json());

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "알림 처리 정보를 확인해주세요.", 400);
    }

    const data =
      parsed.data.all === true
        ? await markAllNotificationsRead(tenantUser)
        : await markNotificationRead({
            ...tenantUser,
            notificationId: parsed.data.notificationId as string
          });

    return success(data);
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}
