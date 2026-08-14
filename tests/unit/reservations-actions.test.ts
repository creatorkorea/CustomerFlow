import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("@/server/auth/session", () => ({
  requireUser: vi.fn()
}));

vi.mock("@/server/reservations/service", () => ({
  updateReservation: vi.fn()
}));

import { revalidatePath } from "next/cache";

import { requireUser } from "@/server/auth/session";
import { updateReservationAction } from "@/server/reservations/actions";
import { updateReservation } from "@/server/reservations/service";

const sessionUser = {
  id: "3",
  email: "owner@example.com",
  name: "Owner",
  role: "owner",
  organizationId: "7"
};

describe("reservation actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a reservation from the session tenant and refreshes related pages", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(sessionUser);
    vi.mocked(updateReservation).mockResolvedValueOnce({
      id: "81",
      organizationId: "7",
      customerId: "21",
      customerName: "김철수",
      customerPhone: "010-1111-1111",
      userId: "3",
      userName: "Owner",
      title: "방문 설치 예약 변경",
      startAt: "2026-08-14T02:00:00.000Z",
      endAt: "2026-08-14T03:00:00.000Z",
      location: "서울 서초구",
      memo: null,
      status: "in_progress",
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T01:00:00.000Z"
    });

    const formData = new FormData();
    formData.set("reservationId", "81");
    formData.set("title", "방문 설치 예약 변경");
    formData.set("startAt", "2026-08-14T11:00");
    formData.set("endAt", "2026-08-14T12:00");
    formData.set("location", "서울 서초구");
    formData.set("memo", "");
    formData.set("status", "in_progress");

    await updateReservationAction(formData);

    expect(updateReservation).toHaveBeenCalledWith({
      reservationId: 81n,
      organizationId: 7n,
      userId: 3n,
      input: {
        title: "방문 설치 예약 변경",
        startAt: "2026-08-14T11:00:00+09:00",
        endAt: "2026-08-14T12:00:00+09:00",
        location: "서울 서초구",
        memo: undefined,
        status: "in_progress"
      }
    });
    expect(revalidatePath).toHaveBeenCalledWith("/reservations");
    expect(revalidatePath).toHaveBeenCalledWith("/reservations/81");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("does not update when the form payload is invalid", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(sessionUser);
    const formData = new FormData();
    formData.set("reservationId", "81");
    formData.set("title", "");
    formData.set("startAt", "2026-08-14T12:00");
    formData.set("endAt", "2026-08-14T11:00");
    formData.set("status", "scheduled");

    await updateReservationAction(formData);

    expect(updateReservation).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
