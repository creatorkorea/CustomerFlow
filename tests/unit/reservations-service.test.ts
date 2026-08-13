import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    reservation: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn()
    },
    customer: {
      findFirst: vi.fn(),
      update: vi.fn()
    },
    activityLog: {
      create: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

import { prisma } from "@/lib/db";
import {
  createReservation,
  listReservations
} from "@/server/reservations/service";

describe("reservation service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only non-deleted reservations for the current organization", async () => {
    vi.mocked(prisma.reservation.count).mockResolvedValueOnce(1);
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([
      {
        id: 71n,
        organizationId: 7n,
        customerId: 21n,
        userId: 3n,
        title: "방문 설치 예약",
        startAt: new Date("2026-08-14T01:00:00.000Z"),
        endAt: new Date("2026-08-14T02:00:00.000Z"),
        location: "서울 강남구",
        memo: null,
        status: "scheduled",
        createdAt: new Date("2026-08-13T00:00:00.000Z"),
        updatedAt: new Date("2026-08-13T00:00:00.000Z"),
        customer: {
          id: 21n,
          name: "김철수",
          phone: "010-1111-1111"
        },
        user: {
          id: 3n,
          name: "홍길동"
        }
      }
    ] as never);

    const result = await listReservations({
      organizationId: 7n,
      customerId: "21",
      status: "scheduled"
    });

    expect(prisma.reservation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 7n,
          deletedAt: null,
          customerId: 21n,
          status: "scheduled"
        }
      })
    );
    expect(result).toMatchObject({
      total: 1,
      reservations: [
        {
          id: "71",
          customerId: "21",
          customerName: "김철수",
          status: "scheduled",
          title: "방문 설치 예약"
        }
      ]
    });
  });

  it("creates a reservation for a customer in the current organization and marks the customer reserved", async () => {
    const customerUpdate = vi.fn();
    const activityCreate = vi.fn();

    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce({
      id: 21n
    } as never);
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
      callback({
        reservation: {
          create: vi.fn().mockResolvedValueOnce({
            id: 81n,
            organizationId: 7n,
            customerId: 21n,
            userId: 3n,
            title: "방문 설치 예약",
            startAt: new Date("2026-08-14T01:00:00.000Z"),
            endAt: new Date("2026-08-14T02:00:00.000Z"),
            location: "서울 강남구",
            memo: "엘리베이터 예약 필요",
            status: "scheduled",
            createdAt: new Date("2026-08-13T00:00:00.000Z"),
            updatedAt: new Date("2026-08-13T00:00:00.000Z"),
            customer: {
              id: 21n,
              name: "김철수",
              phone: "010-1111-1111"
            },
            user: {
              id: 3n,
              name: "홍길동"
            }
          })
        },
        customer: {
          update: customerUpdate
        },
        activityLog: {
          create: activityCreate
        }
      } as never)
    );

    const result = await createReservation({
      organizationId: 7n,
      userId: 3n,
      input: {
        customerId: "21",
        title: "방문 설치 예약",
        startAt: "2026-08-14T10:00:00+09:00",
        endAt: "2026-08-14T11:00:00+09:00",
        location: "서울 강남구",
        memo: "엘리베이터 예약 필요",
        status: "scheduled"
      }
    });

    expect(prisma.customer.findFirst).toHaveBeenCalledWith({
      where: {
        id: 21n,
        organizationId: 7n,
        deletedAt: null
      },
      select: {
        id: true
      }
    });
    expect(customerUpdate).toHaveBeenCalledWith({
      where: {
        id: 21n
      },
      data: {
        status: "reserved"
      }
    });
    expect(activityCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 7n,
          userId: 3n,
          entityType: "RESERVATION",
          action: "RESERVATION_CREATED"
        })
      })
    );
    expect(result).toMatchObject({
      id: "81",
      organizationId: "7",
      customerId: "21",
      customerName: "김철수",
      status: "scheduled"
    });
  });
});
