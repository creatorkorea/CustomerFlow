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
      count: vi.fn(),
      findMany: vi.fn()
    },
    notification: {
      count: vi.fn(),
      findMany: vi.fn()
    },
    activityLog: {
      findMany: vi.fn()
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
    vi.mocked(prisma.notification.count).mockResolvedValueOnce(6);
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.followUp.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.consultation.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.notification.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.activityLog.findMany).mockResolvedValueOnce([]);

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
      openConsultations: 5,
      unreadNotifications: 6
    });
  });

  it("returns operational queues with serialized dates", async () => {
    vi.mocked(prisma.reservation.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.customer.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.followUp.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.consultation.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.notification.count).mockResolvedValueOnce(0);
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
    vi.mocked(prisma.consultation.findMany).mockResolvedValueOnce([
      {
        id: 111n,
        customerId: 23n,
        content: "견적 문의 후 방문 예약 검토",
        nextAction: "내일 오전 재연락",
        status: "consulting",
        createdAt: new Date("2026-08-13T07:30:00.000Z"),
        customer: {
          name: "박민수",
          phone: "010-2222-2222"
        }
      }
    ] as never);
    vi.mocked(prisma.notification.findMany).mockResolvedValueOnce([
      {
        id: 301n,
        type: "follow_up_due",
        title: "후속 연락 예정",
        message: "김철수 고객에게 연락할 시간입니다.",
        linkUrl: "/customers/21",
        createdAt: new Date("2026-08-13T07:45:00.000Z")
      }
    ] as never);
    vi.mocked(prisma.activityLog.findMany).mockResolvedValueOnce([
      {
        id: 201n,
        entityType: "CUSTOMER",
        entityId: 21n,
        action: "CUSTOMER_CREATED",
        metadata: {
          source: "customer-service"
        },
        createdAt: new Date("2026-08-13T08:00:00.000Z"),
        user: {
          name: "홍길동"
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
    expect(result.recentConsultations).toEqual([
      {
        id: "111",
        customerId: "23",
        customerName: "박민수",
        customerPhone: "010-2222-2222",
        content: "견적 문의 후 방문 예약 검토",
        nextAction: "내일 오전 재연락",
        status: "consulting",
        createdAt: "2026-08-13T07:30:00.000Z"
      }
    ]);
    expect(result.unreadNotifications).toEqual([
      {
        id: "301",
        type: "follow_up_due",
        title: "후속 연락 예정",
        message: "김철수 고객에게 연락할 시간입니다.",
        linkUrl: "/customers/21",
        createdAt: "2026-08-13T07:45:00.000Z"
      }
    ]);
    expect(result.recentActivities).toEqual([
      {
        id: "201",
        entityType: "CUSTOMER",
        entityId: "21",
        action: "CUSTOMER_CREATED",
        actionLabel: "고객 등록",
        entityLabel: "고객",
        href: "/customers/21",
        userName: "홍길동",
        createdAt: "2026-08-13T08:00:00.000Z"
      }
    ]);
  });
});
