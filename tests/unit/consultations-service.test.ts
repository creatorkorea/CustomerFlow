import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    consultation: {
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
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
  createConsultation,
  listConsultations
} from "@/server/consultations/service";
import { AppError } from "@/server/shared/http-errors";

describe("consultation service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only non-deleted consultations for the current organization", async () => {
    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce({
      id: 21n
    } as never);
    vi.mocked(prisma.consultation.count).mockResolvedValueOnce(1);
    vi.mocked(prisma.consultation.findMany).mockResolvedValueOnce([
      {
        id: 51n,
        organizationId: 7n,
        customerId: 21n,
        userId: 3n,
        channel: "phone",
        type: "inquiry",
        status: "consulting",
        content: "설치 가능 시간 문의",
        result: null,
        nextAction: null,
        followUpAt: null,
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

    const result = await listConsultations({
      organizationId: 7n,
      customerId: "21",
      status: "consulting"
    });

    expect(prisma.consultation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 7n,
          deletedAt: null,
          customerId: 21n,
          status: "consulting"
        }
      })
    );
    expect(result).toMatchObject({
      total: 1,
      consultations: [
        {
          id: "51",
          customerId: "21",
          customerName: "김철수",
          status: "consulting"
        }
      ]
    });
  });

  it("returns not found when listing consultations for a customer outside the current organization", async () => {
    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce(null);

    await expect(
      listConsultations({
        organizationId: 7n,
        customerId: "999"
      })
    ).rejects.toMatchObject(new AppError("NOT_FOUND", "고객을 찾을 수 없습니다.", 404));

    expect(prisma.consultation.findMany).not.toHaveBeenCalled();
  });

  it("creates a consultation for a customer in the current organization and marks the customer consulting", async () => {
    const customerUpdate = vi.fn();

    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce({
      id: 21n
    } as never);
    vi.mocked(prisma.consultation.findUnique).mockResolvedValueOnce({
      id: 61n,
      organizationId: 7n,
      customerId: 21n,
      userId: 3n,
      channel: "phone",
      type: "inquiry",
      status: "consulting",
      content: "설치 가능 시간 문의",
      result: "토요일 오후 가능 안내",
      nextAction: "예약 확정 연락",
      followUpAt: null,
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
    } as never);
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
      callback({
        consultation: {
          create: vi.fn().mockResolvedValueOnce({
            id: 61n,
            organizationId: 7n,
            customerId: 21n,
            userId: 3n,
            channel: "phone",
            type: "inquiry",
            status: "consulting",
            content: "설치 가능 시간 문의",
            result: "토요일 오후 가능 안내",
            nextAction: "예약 확정 연락",
            followUpAt: null,
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
          create: vi.fn()
        }
      } as never)
    );

    const result = await createConsultation({
      organizationId: 7n,
      userId: 3n,
      input: {
        customerId: "21",
        channel: "phone",
        type: "inquiry",
        status: "consulting",
        content: "설치 가능 시간 문의",
        result: "토요일 오후 가능 안내",
        nextAction: "예약 확정 연락"
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
        lastContactedAt: new Date("2026-08-13T00:00:00.000Z"),
        status: "consulting"
      }
    });
    expect(result).toMatchObject({
      id: "61",
      organizationId: "7",
      customerId: "21",
      customerName: "김철수",
      status: "consulting"
    });
  });
});
