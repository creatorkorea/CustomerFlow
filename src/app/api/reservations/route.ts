import { requireOrganizationId, requireUser } from "@/server/auth/session";
import {
  createReservation,
  listReservations
} from "@/server/reservations/service";
import {
  createReservationSchema,
  listReservationsSchema
} from "@/server/reservations/validation";
import { failure, success } from "@/server/shared/api-response";
import { toApiError } from "@/server/shared/http-errors";

export async function GET(request: Request) {
  try {
    const organizationId = await requireOrganizationId();
    const url = new URL(request.url);
    const parsed = listReservationsSchema.safeParse(
      Object.fromEntries(url.searchParams.entries())
    );

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "검색 조건을 확인해주세요.", 400);
    }

    const data = await listReservations({
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
    const parsed = createReservationSchema.safeParse(await request.json());

    if (!parsed.success || !user.organizationId) {
      return failure("VALIDATION_ERROR", "예약 정보를 확인해주세요.", 400);
    }

    const reservation = await createReservation({
      organizationId: BigInt(user.organizationId),
      userId: BigInt(user.id),
      input: parsed.data
    });

    return success(reservation, 201);
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}
