import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    consultation: {
      findMany: vi.fn()
    },
    reservation: {
      findMany: vi.fn()
    },
    followUp: {
      findMany: vi.fn()
    }
  }
}));

import { prisma } from "@/lib/db";
import { listCustomerTimeline } from "@/server/customers/timeline-service";

describe("customer timeline service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries customer timeline records only inside the current organization", async () => {
    vi.mocked(prisma.consultation.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.followUp.findMany).mockResolvedValueOnce([]);

    await listCustomerTimeline({
      organizationId: 7n,
      customerId: 21n
    });

    expect(prisma.consultation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 7n,
          customerId: 21n,
          deletedAt: null
        }
      })
    );
    expect(prisma.reservation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 7n,
          customerId: 21n,
          deletedAt: null
        }
      })
    );
    expect(prisma.followUp.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 7n,
          customerId: 21n,
          deletedAt: null
        }
      })
    );
  });

  it("merges consultations, reservations, and follow-ups in descending timeline order", async () => {
    vi.mocked(prisma.consultation.findMany).mockResolvedValueOnce([
      {
        id: 31n,
        channel: "phone",
        status: "consulting",
        content: "설치 가능 시간 문의",
        result: "토요일 오후 가능",
        nextAction: null,
        createdAt: new Date("2026-08-13T01:00:00.000Z"),
        user: {
          name: "홍길동"
        }
      }
    ] as never);
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([
      {
        id: 41n,
        title: "방문 설치 예약",
        status: "scheduled",
        startAt: new Date("2026-08-14T01:00:00.000Z"),
        endAt: new Date("2026-08-14T02:00:00.000Z"),
        location: "서울 강남구",
        createdAt: new Date("2026-08-13T02:00:00.000Z"),
        user: null
      }
    ] as never);
    vi.mocked(prisma.followUp.findMany).mockResolvedValueOnce([
      {
        id: 51n,
        title: "예약 전 확인 연락",
        status: "pending",
        dueAt: new Date("2026-08-15T01:00:00.000Z"),
        completedAt: null,
        createdAt: new Date("2026-08-13T03:00:00.000Z"),
        user: {
          name: "홍길동"
        }
      }
    ] as never);

    const result = await listCustomerTimeline({
      organizationId: 7n,
      customerId: 21n
    });

    expect(result).toEqual([
      expect.objectContaining({
        id: "follow-up-51",
        type: "followUp",
        title: "예약 전 확인 연락",
        occurredAt: "2026-08-15T01:00:00.000Z"
      }),
      expect.objectContaining({
        id: "reservation-41",
        type: "reservation",
        title: "방문 설치 예약",
        occurredAt: "2026-08-14T01:00:00.000Z"
      }),
      expect.objectContaining({
        id: "consultation-31",
        type: "consultation",
        title: "설치 가능 시간 문의",
        occurredAt: "2026-08-13T01:00:00.000Z"
      })
    ]);
  });
});
