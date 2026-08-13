"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/session";
import type { ConsultationActionState } from "@/server/consultations/action-state";
import { createConsultation } from "@/server/consultations/service";
import { createConsultationSchema } from "@/server/consultations/validation";

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createConsultationAction(
  _previousState: ConsultationActionState,
  formData: FormData
): Promise<ConsultationActionState> {
  const user = await requireUser();
  const parsed = createConsultationSchema.safeParse(formDataToObject(formData));

  if (!parsed.success || !user.organizationId) {
    return {
      status: "error",
      message: "상담 정보를 확인해주세요."
    };
  }

  const consultation = await createConsultation({
    organizationId: BigInt(user.organizationId),
    userId: BigInt(user.id),
    input: parsed.data
  });

  redirect(`/consultations?customerId=${consultation.customerId}`);
}
