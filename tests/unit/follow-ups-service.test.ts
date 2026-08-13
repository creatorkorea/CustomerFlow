import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    followUp: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn()
    },
    customer: {
      findFirst: vi.fn()
    },
    consultation: {
      findFirst: vi.fn()
    },
    activityLog: {
      create: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

import { prisma } from "@/lib/db";
import { createFollowUp, listFollowUps } from "@/server/follow-ups/service";

describe("follow-up service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only non-deleted follow-ups for the current organization", async () => {
    vi.mocked(prisma.followUp.count).mockResolvedValueOnce(1);
    vi.mocked(prisma.followUp.findMany).mockResolvedValueOnce([
      {
        id: 91n,
        organizationId: 7n,
        customerId: 21n,
        consultationId: null,
        userId: 3n,
        title: "예약 전 확인 연락",
        memo: null,
        dueAt: new Date("2026-08-15T01:00:00.000Z"),
        status: "pending",
        completedAt: null,
        createdAt: new Date("2026-08-13T00:00:00.000Z"),
        updatedAt: new Date("2026-08-13T00:00:00.000Z"),
        customer: {
          id: 21n,
          name: "김철수",
          phone: "010-1111-1111"
        },
        consultation: null,
        user: {
          id: 3n,
          name: "홍길동"
        }
      }
    ] as never);

    const result = await listFollowUps({
      organizationId: 7n,
      customerId: "21",
      status: "pending"
    });

    expect(prisma.followUp.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 7n,
          deletedAt: null,
          customerId: 21n,
          status: "pending"
        }
      })
    );
    expect(result).toMatchObject({
      total: 1,
      followUps: [
        {
          id: "91",
          customerId: "21",
          customerName: "김철수",
          status: "pending",
          title: "예약 전 확인 연락"
        }
      ]
    });
  });

  it("creates a follow-up for a customer in the current organization and logs the activity", async () => {
    const activityCreate = vi.fn();

    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce({
      id: 21n
    } as never);
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
      callback({
        followUp: {
          create: vi.fn().mockResolvedValueOnce({
            id: 101n,
            organizationId: 7n,
            customerId: 21n,
            consultationId: null,
            userId: 3n,
            title: "예약 전 확인 연락",
            memo: "방문 가능 여부 재확인",
            dueAt: new Date("2026-08-15T01:00:00.000Z"),
            status: "pending",
            completedAt: null,
            createdAt: new Date("2026-08-13T00:00:00.000Z"),
            updatedAt: new Date("2026-08-13T00:00:00.000Z"),
            customer: {
              id: 21n,
              name: "김철수",
              phone: "010-1111-1111"
            },
            consultation: null,
            user: {
              id: 3n,
              name: "홍길동"
            }
          })
        },
        activityLog: {
          create: activityCreate
        }
      } as never)
    );

    const result = await createFollowUp({
      organizationId: 7n,
      userId: 3n,
      input: {
        customerId: "21",
        title: "예약 전 확인 연락",
        memo: "방문 가능 여부 재확인",
        dueAt: "2026-08-15T10:00:00+09:00",
        status: "pending"
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
    expect(activityCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 7n,
          userId: 3n,
          entityType: "FOLLOW_UP",
          action: "FOLLOW_UP_CREATED"
        })
      })
    );
    expect(result).toMatchObject({
      id: "101",
      organizationId: "7",
      customerId: "21",
      customerName: "김철수",
      status: "pending"
    });
  });
});
