import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireOrganizationId: vi.fn(),
  requireUser: vi.fn()
}));

vi.mock("@/server/reservations/service", () => ({
  createReservation: vi.fn(),
  listReservations: vi.fn()
}));

import { GET, POST } from "@/app/api/reservations/route";
import { requireOrganizationId, requireUser } from "@/server/auth/session";
import {
  createReservation,
  listReservations
} from "@/server/reservations/service";

describe("/api/reservations", () => {
  it("uses the session organization when listing reservations", async () => {
    vi.mocked(requireOrganizationId).mockResolvedValueOnce(7n);
    vi.mocked(listReservations).mockResolvedValueOnce({
      reservations: [],
      total: 0,
      page: 1,
      pageSize: 20
    });

    const response = await GET(
      new Request("http://localhost/api/reservations?customerId=21")
    );

    expect(response.status).toBe(200);
    expect(listReservations).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 7n,
        customerId: "21"
      })
    );
  });

  it("rejects invalid reservation date ranges before creating records", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce({
      id: "3",
      email: "owner@example.com",
      name: "Owner",
      role: "owner",
      organizationId: "7"
    });

    const response = await POST(
      new Request("http://localhost/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          customerId: "21",
          title: "방문 설치 예약",
          startAt: "2026-08-14T11:00:00+09:00",
          endAt: "2026-08-14T10:00:00+09:00"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(createReservation).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR"
      }
    });
  });
});
