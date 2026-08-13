import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    reservation: {
      count: vi.fn(),
      findMany: vi.fn()
    },
    customer: {
      count: vi.fn()
    },
    followUp: {
      count: vi.fn(),
      findMany: vi.fn()
    },
    consultation: {
      count: vi.fn()
    }
  }
}));

import { prisma } from "@/lib/db";
import { getDashboardOverview } from "@/server/dashboard/service";

describe("dashboard service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts dashboard metrics inside the current Asia/Seoul day for the organization", async () => {
    vi.mocked(prisma.reservation.count).mockResolvedValueOnce(2);
    vi.mocked(prisma.customer.count).mockResolvedValueOnce(3);
    vi.mocked(prisma.followUp.count).mockResolvedValueOnce(4);
    vi.mocked(prisma.consultation.count).mockResolvedValueOnce(5);
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.followUp.findMany).mockResolvedValueOnce([]);

    const result = await getDashboardOverview({
      organizationId: 7n,
      now: new Date("2026-08-13T03:00:00.000Z")
    });

    const todayRange = {
      gte: new Date("2026-08-12T15:00:00.000Z"),
      lt: new Date("2026-08-13T15:00:00.000Z")
    };

    expect(prisma.reservation.count).toHaveBeenCalledWith({
      where: {
        organizationId: 7n,
        deletedAt: null,
        status: {
          in: ["scheduled", "in_progress"]
        },
        startAt: todayRange
      }
    });
    expect(prisma.customer.count).toHaveBeenCalledWith({
      where: {
        organizationId: 7n,
        deletedAt: null,
        createdAt: todayRange
      }
    });
    expect(prisma.followUp.count).toHaveBeenCalledWith({
      where: {
        organizationId: 7n,
        deletedAt: null,
        status: "pending",
        dueAt: {
          lt: todayRange.lt
        }
      }
    });
    expect(prisma.consultation.count).toHaveBeenCalledWith({
      where: {
        organizationId: 7n,
        deletedAt: null,
        status: {
          in: ["new", "consulting", "quote", "reserved", "on_hold"]
        }
      }
    });
    expect(result.metrics).toEqual({
      todayReservations: 2,
      newCustomers: 3,
      pendingFollowUps: 4,
      openConsultations: 5
    });
  });

  it("returns upcoming reservation and pending follow-up queues with serialized dates", async () => {
    vi.mocked(prisma.reservation.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.customer.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.followUp.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.consultation.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([
      {
        id: 71n,
        customerId: 21n,
        title: "방문 설치 예약",
        startAt: new Date("2026-08-13T05:00:00.000Z"),
        endAt: new Date("2026-08-13T06:00:00.000Z"),
        status: "scheduled",
        customer: {
          name: "김철수",
          phone: "010-1111-1111"
        }
      }
    ] as never);
    vi.mocked(prisma.followUp.findMany).mockResolvedValueOnce([
      {
        id: 91n,
        customerId: 22n,
        title: "예약 전 확인 연락",
        dueAt: new Date("2026-08-13T07:00:00.000Z"),
        status: "pending",
        customer: {
          name: "이영희",
          phone: null
        }
      }
    ] as never);

    const result = await getDashboardOverview({
      organizationId: 7n,
      now: new Date("2026-08-13T03:00:00.000Z")
    });

    expect(result.todayReservations).toEqual([
      {
        id: "71",
        customerId: "21",
        customerName: "김철수",
        customerPhone: "010-1111-1111",
        title: "방문 설치 예약",
        startAt: "2026-08-13T05:00:00.000Z",
        endAt: "2026-08-13T06:00:00.000Z",
        status: "scheduled"
      }
    ]);
    expect(result.pendingFollowUps).toEqual([
      {
        id: "91",
        customerId: "22",
        customerName: "이영희",
        customerPhone: null,
        title: "예약 전 확인 연락",
        dueAt: "2026-08-13T07:00:00.000Z",
        status: "pending"
      }
    ]);
  });
});
