import { requireUser } from "@/server/auth/session";
import { updateReservationStatus } from "@/server/reservations/service";
import { updateReservationStatusSchema } from "@/server/reservations/validation";
import { failure, success } from "@/server/shared/api-response";
import { toApiError } from "@/server/shared/http-errors";

type ReservationRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseReservationId(id: string) {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

export async function PATCH(
  request: Request,
  context: ReservationRouteContext
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const reservationId = parseReservationId(id);
    const parsed = updateReservationStatusSchema.safeParse(await request.json());

    if (!reservationId || !parsed.success || !user.organizationId) {
      return failure("VALIDATION_ERROR", "예약 상태를 확인해주세요.", 400);
    }

    const reservation = await updateReservationStatus({
      reservationId,
      organizationId: BigInt(user.organizationId),
      userId: BigInt(user.id),
      input: parsed.data
    });

    return success(reservation);
  } catch (error) {
    const apiError = toApiError(error);

    return failure(apiError.code, apiError.message, apiError.status);
  }
}
