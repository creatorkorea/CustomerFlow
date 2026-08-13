import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireUser: vi.fn()
}));

vi.mock("@/server/reservations/service", () => ({
  updateReservationStatus: vi.fn()
}));

import { PATCH } from "@/app/api/reservations/[id]/route";
import { requireUser } from "@/server/auth/session";
import { updateReservationStatus } from "@/server/reservations/service";

const owner = {
  id: "3",
  email: "owner@example.com",
  name: "Owner",
  role: "owner",
  organizationId: "7"
};

describe("/api/reservations/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates status using only the session organization", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(owner);
    vi.mocked(updateReservationStatus).mockResolvedValueOnce({
      id: "81",
      organizationId: "7",
      customerId: "21",
      customerName: "김철수",
      customerPhone: null,
      userId: "3",
      userName: "Owner",
      title: "방문 설치 예약",
      startAt: "2026-08-14T01:00:00.000Z",
      endAt: "2026-08-14T02:00:00.000Z",
      location: "서울 강남구",
      memo: null,
      status: "completed",
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T01:00:00.000Z"
    });

    const response = await PATCH(
      new Request("http://localhost/api/reservations/81", {
        method: "PATCH",
        body: JSON.stringify({
          status: "completed",
          organizationId: "999"
        })
      }),
      {
        params: Promise.resolve({ id: "81" })
      }
    );

    expect(response.status).toBe(200);
    expect(updateReservationStatus).toHaveBeenCalledWith({
      reservationId: 81n,
      organizationId: 7n,
      userId: 3n,
      input: {
        status: "completed"
      }
    });
  });

  it("rejects invalid status payloads before updating", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(owner);

    const response = await PATCH(
      new Request("http://localhost/api/reservations/81", {
        method: "PATCH",
        body: JSON.stringify({
          status: "done"
        })
      }),
      {
        params: Promise.resolve({ id: "81" })
      }
    );

    expect(response.status).toBe(400);
    expect(updateReservationStatus).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR"
      }
    });
  });
});
