import { requireOrganizationId, requireUser } from "@/server/auth/session";
import { createFollowUp, listFollowUps } from "@/server/follow-ups/service";
import {
  createFollowUpSchema,
  listFollowUpsSchema
} from "@/server/follow-ups/validation";
import { failure, success } from "@/server/shared/api-response";
import { toApiError } from "@/server/shared/http-errors";

export async function GET(request: Request) {
  try {
    const organizationId = await requireOrganizationId();
    const url = new URL(request.url);
    const parsed = listFollowUpsSchema.safeParse(
      Object.fromEntries(url.searchParams.entries())
    );

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "검색 조건을 확인해주세요.", 400);
    }

    const data = await listFollowUps({
      organizationId,
      ...parsed.data
    });

    return success(data);
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = createFollowUpSchema.safeParse(await request.json());

    if (!parsed.success || !user.organizationId) {
      return failure("VALIDATION_ERROR", "후속관리 정보를 확인해주세요.", 400);
    }

    const followUp = await createFollowUp({
      organizationId: BigInt(user.organizationId),
      userId: BigInt(user.id),
      input: parsed.data
    });

    return success(followUp, 201);
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}
