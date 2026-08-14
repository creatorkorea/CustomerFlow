import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("@/server/auth/session", () => ({
  requireUser: vi.fn()
}));

vi.mock("@/server/consultations/service", () => ({
  updateConsultation: vi.fn()
}));

import { revalidatePath } from "next/cache";

import { requireUser } from "@/server/auth/session";
import { updateConsultationAction } from "@/server/consultations/actions";
import { updateConsultation } from "@/server/consultations/service";

const sessionUser = {
  id: "3",
  email: "owner@example.com",
  name: "Owner",
  role: "owner",
  organizationId: "7"
};

describe("consultation actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a consultation from the session tenant and refreshes related pages", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(sessionUser);
    vi.mocked(updateConsultation).mockResolvedValueOnce({
      id: "51",
      organizationId: "7",
      customerId: "21",
      customerName: "김철수",
      customerPhone: "010-1111-1111",
      userId: "3",
      userName: "Owner",
      channel: "phone",
      type: "inquiry",
      status: "completed",
      content: "설치 가능 시간 문의",
      result: "예약 확정 완료",
      nextAction: null,
      followUpAt: null,
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T01:00:00.000Z"
    });

    const formData = new FormData();
    formData.set("consultationId", "51");
    formData.set("status", "completed");
    formData.set("result", "예약 확정 완료");
    formData.set("nextAction", "");

    await updateConsultationAction(formData);

    expect(updateConsultation).toHaveBeenCalledWith({
      consultationId: 51n,
      organizationId: 7n,
      userId: 3n,
      input: {
        status: "completed",
        result: "예약 확정 완료",
        nextAction: undefined
      }
    });
    expect(revalidatePath).toHaveBeenCalledWith("/consultations");
    expect(revalidatePath).toHaveBeenCalledWith("/consultations/51");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("does not update when the form payload is invalid", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(sessionUser);
    const formData = new FormData();
    formData.set("consultationId", "51");
    formData.set("status", "not-a-status");

    await updateConsultationAction(formData);

    expect(updateConsultation).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
