import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    followUp: {
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
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
    notification: {
      create: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

import { prisma } from "@/lib/db";
import {
  createFollowUp,
  getFollowUp,
  listFollowUps,
  updateFollowUp,
  updateFollowUpStatus
} from "@/server/follow-ups/service";
import { AppError } from "@/server/shared/http-errors";

describe("follow-up service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only non-deleted follow-ups for the current organization", async () => {
    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce({
      id: 21n
    } as never);
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

  it("returns not found when listing follow-ups for a customer outside the current organization", async () => {
    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce(null);

    await expect(
      listFollowUps({
        organizationId: 7n,
        customerId: "999"
      })
    ).rejects.toMatchObject(new AppError("NOT_FOUND", "고객을 찾을 수 없습니다.", 404));

    expect(prisma.followUp.findMany).not.toHaveBeenCalled();
  });

  it("creates a follow-up for a customer in the current organization and logs the activity", async () => {
    const activityCreate = vi.fn();
    const notificationCreate = vi.fn();

    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce({
      id: 21n
    } as never);
    vi.mocked(prisma.followUp.findUnique).mockResolvedValueOnce({
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
        },
        notification: {
          create: notificationCreate
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
    expect(notificationCreate).toHaveBeenCalledWith({
      data: {
        organizationId: 7n,
        userId: 3n,
        type: "follow_up",
        title: "후속관리 등록",
        message: "예약 전 확인 연락",
        linkUrl: "/follow-ups/101"
      }
    });
    expect(result).toMatchObject({
      id: "101",
      organizationId: "7",
      customerId: "21",
      customerName: "김철수",
      status: "pending"
    });
  });

  it("updates a follow-up status only inside the current organization and logs the activity", async () => {
    const followUpUpdate = vi.fn().mockResolvedValueOnce({
      id: 101n,
      organizationId: 7n,
      customerId: 21n,
      consultationId: null,
      userId: 3n,
      title: "예약 전 확인 연락",
      memo: null,
      dueAt: new Date("2026-08-15T01:00:00.000Z"),
      status: "completed",
      completedAt: new Date("2026-08-13T01:00:00.000Z"),
      createdAt: new Date("2026-08-13T00:00:00.000Z"),
      updatedAt: new Date("2026-08-13T01:00:00.000Z"),
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
    });
    const activityCreate = vi.fn();
    const notificationCreate = vi.fn();

    vi.mocked(prisma.followUp.findFirst).mockResolvedValueOnce({
      id: 101n,
      customerId: 21n
    } as never);
    vi.mocked(prisma.followUp.findUnique).mockResolvedValueOnce({
      id: 101n,
      organizationId: 7n,
      customerId: 21n,
      consultationId: null,
      userId: 3n,
      title: "예약 전 확인 연락",
      memo: null,
      dueAt: new Date("2026-08-15T01:00:00.000Z"),
      status: "completed",
      completedAt: new Date("2026-08-13T01:00:00.000Z"),
      createdAt: new Date("2026-08-13T00:00:00.000Z"),
      updatedAt: new Date("2026-08-13T01:00:00.000Z"),
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
    } as never);
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
      callback({
        followUp: {
          update: followUpUpdate
        },
        activityLog: {
          create: activityCreate
        },
        notification: {
          create: notificationCreate
        }
      } as never)
    );

    const result = await updateFollowUpStatus({
      followUpId: 101n,
      organizationId: 7n,
      userId: 3n,
      input: {
        status: "completed"
      }
    });

    expect(prisma.followUp.findFirst).toHaveBeenCalledWith({
      where: {
        id: 101n,
        organizationId: 7n,
        deletedAt: null
      },
      select: {
        id: true,
        customerId: true
      }
    });
    expect(followUpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 101n
        },
        data: {
          status: "completed",
          completedAt: expect.any(Date)
        }
      })
    );
    expect(activityCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 7n,
          userId: 3n,
          entityType: "FOLLOW_UP",
          entityId: 101n,
          action: "FOLLOW_UP_STATUS_UPDATED",
          metadata: {
            customerId: "21",
            status: "completed",
            source: "follow-up-service"
          }
        })
      })
    );
    expect(notificationCreate).toHaveBeenCalledWith({
      data: {
        organizationId: 7n,
        userId: 3n,
        type: "follow_up",
        title: "후속관리 상태 변경",
        message: "예약 전 확인 연락: completed",
        linkUrl: "/follow-ups/101"
      }
    });
    expect(result).toMatchObject({
      id: "101",
      status: "completed",
      completedAt: expect.any(String)
    });
  });

  it("gets one follow-up only inside the current organization", async () => {
    vi.mocked(prisma.followUp.findFirst).mockResolvedValueOnce({
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
    } as never);

    const result = await getFollowUp({
      followUpId: 101n,
      organizationId: 7n
    });

    expect(prisma.followUp.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 101n,
          organizationId: 7n,
          deletedAt: null
        }
      })
    );
    expect(result).toMatchObject({
      id: "101",
      organizationId: "7",
      customerId: "21",
      customerName: "김철수",
      title: "예약 전 확인 연락",
      status: "pending"
    });
  });

  it("returns not found when getting a follow-up outside the current organization", async () => {
    vi.mocked(prisma.followUp.findFirst).mockResolvedValueOnce(null);

    await expect(
      getFollowUp({
        followUpId: 999n,
        organizationId: 7n
      })
    ).rejects.toMatchObject(
      new AppError("NOT_FOUND", "후속관리를 찾을 수 없습니다.", 404)
    );
  });

  it("updates follow-up details inside the current organization and logs the activity", async () => {
    const followUpUpdate = vi.fn().mockResolvedValueOnce({
      id: 101n,
      organizationId: 7n,
      customerId: 21n,
      consultationId: null,
      userId: 3n,
      title: "방문 후 만족도 확인",
      memo: null,
      dueAt: new Date("2026-08-16T01:00:00.000Z"),
      status: "completed",
      completedAt: new Date("2026-08-13T01:00:00.000Z"),
      createdAt: new Date("2026-08-13T00:00:00.000Z"),
      updatedAt: new Date("2026-08-13T01:00:00.000Z"),
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
    });
    const activityCreate = vi.fn();

    vi.mocked(prisma.followUp.findFirst).mockResolvedValueOnce({
      id: 101n,
      customerId: 21n
    } as never);
    vi.mocked(prisma.followUp.findUnique).mockResolvedValueOnce({
      id: 101n,
      organizationId: 7n,
      customerId: 21n,
      consultationId: null,
      userId: 3n,
      title: "방문 후 만족도 확인",
      memo: null,
      dueAt: new Date("2026-08-16T01:00:00.000Z"),
      status: "completed",
      completedAt: new Date("2026-08-13T01:00:00.000Z"),
      createdAt: new Date("2026-08-13T00:00:00.000Z"),
      updatedAt: new Date("2026-08-13T01:00:00.000Z"),
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
    } as never);
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
      callback({
        followUp: {
          update: followUpUpdate
        },
        activityLog: {
          create: activityCreate
        }
      } as never)
    );

    const result = await updateFollowUp({
      followUpId: 101n,
      organizationId: 7n,
      userId: 3n,
      input: {
        title: "방문 후 만족도 확인",
        memo: undefined,
        dueAt: "2026-08-16T10:00:00+09:00",
        status: "completed"
      }
    });

    expect(prisma.followUp.findFirst).toHaveBeenCalledWith({
      where: {
        id: 101n,
        organizationId: 7n,
        deletedAt: null
      },
      select: {
        id: true,
        customerId: true
      }
    });
    expect(followUpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 101n
        },
        data: {
          title: "방문 후 만족도 확인",
          memo: null,
          dueAt: new Date("2026-08-16T01:00:00.000Z"),
          status: "completed",
          completedAt: expect.any(Date),
          userId: 3n
        }
      })
    );
    expect(followUpUpdate).not.toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.anything()
      })
    );
    expect(prisma.followUp.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 101n
        }
      })
    );
    expect(activityCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 7n,
          userId: 3n,
          entityType: "FOLLOW_UP",
          entityId: 101n,
          action: "FOLLOW_UP_UPDATED",
          metadata: {
            customerId: "21",
            status: "completed",
            source: "follow-up-service"
          }
        })
      })
    );
    expect(result).toMatchObject({
      id: "101",
      title: "방문 후 만족도 확인",
      status: "completed",
      memo: null
    });
  });
});
