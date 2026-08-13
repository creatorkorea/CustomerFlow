import { requireUser } from "@/server/auth/session";
import { updateFollowUpStatus } from "@/server/follow-ups/service";
import { updateFollowUpStatusSchema } from "@/server/follow-ups/validation";
import { failure, success } from "@/server/shared/api-response";
import { toApiError } from "@/server/shared/http-errors";

type FollowUpRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseFollowUpId(id: string) {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

export async function PATCH(
  request: Request,
  context: FollowUpRouteContext
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const followUpId = parseFollowUpId(id);
    const parsed = updateFollowUpStatusSchema.safeParse(await request.json());

    if (!followUpId || !parsed.success || !user.organizationId) {
      return failure("VALIDATION_ERROR", "후속관리 상태를 확인해주세요.", 400);
    }

    const followUp = await updateFollowUpStatus({
      followUpId,
      organizationId: BigInt(user.organizationId),
      userId: BigInt(user.id),
      input: parsed.data
    });

    return success(followUp);
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}
