"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/session";
import type { ReservationActionState } from "@/server/reservations/action-state";
import {
  createReservation,
  updateReservationStatus
} from "@/server/reservations/service";
import {
  createReservationSchema,
  updateReservationStatusSchema
} from "@/server/reservations/validation";

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

export async function createReservationAction(
  _previousState: ReservationActionState,
  formData: FormData
): Promise<ReservationActionState> {
  const user = await requireUser();
  const payload = formDataToObject(formData);
  const parsed = createReservationSchema.safeParse({
    ...payload,
    startAt: normalizeKstDateTimeLocal(payload.startAt),
    endAt: normalizeKstDateTimeLocal(payload.endAt)
  });

  if (!parsed.success || !user.organizationId) {
    return {
      status: "error",
      message: "예약 정보를 확인해주세요."
    };
  }

  const reservation = await createReservation({
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id),
    input: parsed.data
  });

  redirect(`/reservations?customerId=${reservation.customerId}`);
}

export async function updateReservationStatusAction(formData: FormData) {
  const user = await requireUser();
  const reservationId = formData.get("reservationId");
  const parsed = updateReservationStatusSchema.safeParse({
    status: formData.get("status")
  });

  if (
    !parsed.success ||
    !user.organizationId ||
    typeof reservationId !== "string"
  ) {
    return;
  }

  await updateReservationStatus({
    reservationId: BigInt(reservationId),
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id),
    input: parsed.data
  });

  revalidatePath("/reservations");
}
