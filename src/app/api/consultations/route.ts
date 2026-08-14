import { requireOrganizationId, requireUser } from "@/server/auth/session";
import {
  createConsultation,
  listConsultations
} from "@/server/consultations/service";
import {
  createConsultationSchema,
  listConsultationsSchema
} from "@/server/consultations/validation";
import { failure, success } from "@/server/shared/api-response";
import { toApiError } from "@/server/shared/http-errors";

export async function GET(request: Request) {
  try {
    const organizationId = await requireOrganizationId();
    const url = new URL(request.url);
    const parsed = listConsultationsSchema.safeParse(
      Object.fromEntries(url.searchParams.entries())
    );

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "검색 조건을 확인해주세요.", 400);
    }

    const data = await listConsultations({
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
    const parsed = createConsultationSchema.safeParse(await request.json());

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "상담 정보를 확인해주세요.", 400);
    }

    if (!user.organizationId) {
      return failure("FORBIDDEN", "사업장 권한을 확인할 수 없습니다.", 403);
    }

    const consultation = await createConsultation({
      organizationId: BigInt(user.organizationId),
      userId: BigInt(user.id),
      input: parsed.data
    });

    return success(consultation, 201);
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}
