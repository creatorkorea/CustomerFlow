import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    reservation: {
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    },
    customer: {
      findFirst: vi.fn(),
      update: vi.fn()
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
  createReservation,
  getReservation,
  listReservations,
  updateReservation,
  updateReservationStatus
} from "@/server/reservations/service";
import { AppError } from "@/server/shared/http-errors";

describe("reservation service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only non-deleted reservations for the current organization", async () => {
    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce({
      id: 21n
    } as never);
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

  it("returns not found when listing reservations for a customer outside the current organization", async () => {
    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce(null);

    await expect(
      listReservations({
        organizationId: 7n,
        customerId: "999"
      })
    ).rejects.toMatchObject(new AppError("NOT_FOUND", "고객을 찾을 수 없습니다.", 404));

    expect(prisma.reservation.findMany).not.toHaveBeenCalled();
  });

  it("creates a reservation for a customer in the current organization and marks the customer reserved", async () => {
    const customerUpdate = vi.fn();
    const activityCreate = vi.fn();
    const notificationCreate = vi.fn();

    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce({
      id: 21n
    } as never);
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
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
        },
        notification: {
          create: notificationCreate
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
    expect(notificationCreate).toHaveBeenCalledWith({
      data: {
        organizationId: 7n,
        userId: 3n,
        type: "reservation",
        title: "예약 등록",
        message: "방문 설치 예약",
        linkUrl: "/reservations/81"
      }
    });
    expect(result).toMatchObject({
      id: "81",
      organizationId: "7",
      customerId: "21",
      customerName: "김철수",
      status: "scheduled"
    });
  });

  it("updates a reservation status only inside the current organization and logs the activity", async () => {
    const reservationUpdate = vi.fn().mockResolvedValueOnce({
      id: 81n,
      organizationId: 7n,
      customerId: 21n,
      userId: 3n,
      title: "방문 설치 예약",
      startAt: new Date("2026-08-14T01:00:00.000Z"),
      endAt: new Date("2026-08-14T02:00:00.000Z"),
      location: "서울 강남구",
      memo: null,
      status: "completed",
      createdAt: new Date("2026-08-13T00:00:00.000Z"),
      updatedAt: new Date("2026-08-13T01:00:00.000Z"),
      customer: {
        id: 21n,
        name: "김철수",
        phone: "010-1111-1111"
      },
      user: {
        id: 3n,
        name: "홍길동"
      }
    });
    const customerUpdate = vi.fn();
    const activityCreate = vi.fn();
    const notificationCreate = vi.fn();

    vi.mocked(prisma.reservation.findFirst).mockResolvedValueOnce({
      id: 81n,
      customerId: 21n
    } as never);
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: 81n,
      organizationId: 7n,
      customerId: 21n,
      userId: 3n,
      title: "방문 설치 예약",
      startAt: new Date("2026-08-14T01:00:00.000Z"),
      endAt: new Date("2026-08-14T02:00:00.000Z"),
      location: "서울 강남구",
      memo: null,
      status: "completed",
      createdAt: new Date("2026-08-13T00:00:00.000Z"),
      updatedAt: new Date("2026-08-13T01:00:00.000Z"),
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
        reservation: {
          update: reservationUpdate
        },
        customer: {
          update: customerUpdate
        },
        activityLog: {
          create: activityCreate
        },
        notification: {
          create: notificationCreate
        }
      } as never)
    );

    const result = await updateReservationStatus({
      reservationId: 81n,
      organizationId: 7n,
      userId: 3n,
      input: {
        status: "completed"
      }
    });

    expect(prisma.reservation.findFirst).toHaveBeenCalledWith({
      where: {
        id: 81n,
        organizationId: 7n,
        deletedAt: null
      },
      select: {
        id: true,
        customerId: true
      }
    });
    expect(reservationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 81n
        },
        data: {
          status: "completed"
        }
      })
    );
    expect(reservationUpdate).not.toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.anything()
      })
    );
    expect(prisma.reservation.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 81n
        }
      })
    );
    expect(customerUpdate).toHaveBeenCalledWith({
      where: {
        id: 21n
      },
      data: {
        status: "completed"
      }
    });
    expect(activityCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 7n,
          userId: 3n,
          entityType: "RESERVATION",
          entityId: 81n,
          action: "RESERVATION_STATUS_UPDATED",
          metadata: {
            customerId: "21",
            status: "completed",
            source: "reservation-service"
          }
        })
      })
    );
    expect(notificationCreate).toHaveBeenCalledWith({
      data: {
        organizationId: 7n,
        userId: 3n,
        type: "reservation",
        title: "예약 상태 변경",
        message: "방문 설치 예약: completed",
        linkUrl: "/reservations/81"
      }
    });
    expect(result).toMatchObject({
      id: "81",
      status: "completed"
    });
  });

  it("gets one reservation only inside the current organization", async () => {
    vi.mocked(prisma.reservation.findFirst).mockResolvedValueOnce({
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
    } as never);

    const result = await getReservation({
      reservationId: 81n,
      organizationId: 7n
    });

    expect(prisma.reservation.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 81n,
          organizationId: 7n,
          deletedAt: null
        }
      })
    );
    expect(result).toMatchObject({
      id: "81",
      organizationId: "7",
      customerId: "21",
      customerName: "김철수",
      title: "방문 설치 예약",
      status: "scheduled"
    });
  });

  it("returns not found when getting a reservation outside the current organization", async () => {
    vi.mocked(prisma.reservation.findFirst).mockResolvedValueOnce(null);

    await expect(
      getReservation({
        reservationId: 999n,
        organizationId: 7n
      })
    ).rejects.toMatchObject(new AppError("NOT_FOUND", "예약을 찾을 수 없습니다.", 404));
  });

  it("updates reservation details inside the current organization and logs the activity", async () => {
    const reservationUpdate = vi.fn().mockResolvedValueOnce({
      id: 81n,
      organizationId: 7n,
      customerId: 21n,
      userId: 3n,
      title: "방문 설치 예약 변경",
      startAt: new Date("2026-08-14T02:00:00.000Z"),
      endAt: new Date("2026-08-14T03:00:00.000Z"),
      location: "서울 서초구",
      memo: null,
      status: "in_progress",
      createdAt: new Date("2026-08-13T00:00:00.000Z"),
      updatedAt: new Date("2026-08-13T01:00:00.000Z"),
      customer: {
        id: 21n,
        name: "김철수",
        phone: "010-1111-1111"
      },
      user: {
        id: 3n,
        name: "홍길동"
      }
    });
    const customerUpdate = vi.fn();
    const activityCreate = vi.fn();

    vi.mocked(prisma.reservation.findFirst).mockResolvedValueOnce({
      id: 81n,
      customerId: 21n
    } as never);
    vi.mocked(prisma.reservation.findUnique).mockResolvedValueOnce({
      id: 81n,
      organizationId: 7n,
      customerId: 21n,
      userId: 3n,
      title: "방문 설치 예약 변경",
      startAt: new Date("2026-08-14T02:00:00.000Z"),
      endAt: new Date("2026-08-14T03:00:00.000Z"),
      location: "서울 서초구",
      memo: null,
      status: "in_progress",
      createdAt: new Date("2026-08-13T00:00:00.000Z"),
      updatedAt: new Date("2026-08-13T01:00:00.000Z"),
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
        reservation: {
          update: reservationUpdate
        },
        customer: {
          update: customerUpdate
        },
        activityLog: {
          create: activityCreate
        }
      } as never)
    );

    const result = await updateReservation({
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

    expect(prisma.reservation.findFirst).toHaveBeenCalledWith({
      where: {
        id: 81n,
        organizationId: 7n,
        deletedAt: null
      },
      select: {
        id: true,
        customerId: true
      }
    });
    expect(reservationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 81n
        },
        data: {
          title: "방문 설치 예약 변경",
          startAt: new Date("2026-08-14T02:00:00.000Z"),
          endAt: new Date("2026-08-14T03:00:00.000Z"),
          location: "서울 서초구",
          memo: null,
          status: "in_progress",
          userId: 3n
        }
      })
    );
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
          entityId: 81n,
          action: "RESERVATION_UPDATED",
          metadata: {
            customerId: "21",
            status: "in_progress",
            source: "reservation-service"
          }
        })
      })
    );
    expect(result).toMatchObject({
      id: "81",
      title: "방문 설치 예약 변경",
      status: "in_progress",
      memo: null
    });
  });
});
