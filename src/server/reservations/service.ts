import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type {
  CreateReservationInput,
  ListReservationsInput,
  UpdateReservationInput,
  UpdateReservationStatusInput
} from "@/server/reservations/validation";
import { AppError } from "@/server/shared/http-errors";

type ReservationWithRelations = {
  id: bigint;
  organizationId: bigint;
  customerId: bigint;
  userId: bigint | null;
  title: string;
  startAt: Date;
  endAt: Date;
  location: string | null;
  memo: string | null;
  status: CreateReservationInput["status"];
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: bigint;
    name: string;
    phone: string | null;
  };
  user: {
    id: bigint;
    name: string;
  } | null;
};

type ListReservationsParams = Partial<ListReservationsInput> & {
  organizationId: bigint;
};

function serializeReservation(reservation: ReservationWithRelations) {
  return {
    id: reservation.id.toString(),
    organizationId: reservation.organizationId.toString(),
    customerId: reservation.customerId.toString(),
    customerName: reservation.customer.name,
    customerPhone: reservation.customer.phone,
    userId: reservation.userId?.toString() ?? null,
    userName: reservation.user?.name ?? null,
    title: reservation.title,
    startAt: reservation.startAt.toISOString(),
    endAt: reservation.endAt.toISOString(),
    location: reservation.location,
    memo: reservation.memo,
    status: reservation.status,
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString()
  };
}

async function ensureCustomerInOrganization({
  customerId,
  organizationId
}: {
  customerId: bigint;
  organizationId: bigint;
}) {
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  if (!customer) {
    throw new AppError("NOT_FOUND", "고객을 찾을 수 없습니다.", 404);
  }
}

export async function listReservations({
  organizationId,
  customerId,
  status,
  from,
  to,
  page = 1,
  pageSize = 20
}: ListReservationsParams) {
  if (customerId) {
    await ensureCustomerInOrganization({
      customerId: BigInt(customerId),
      organizationId
    });
  }

  const where: Prisma.ReservationWhereInput = {
    organizationId,
    deletedAt: null,
    ...(customerId ? { customerId: BigInt(customerId) } : {}),
    ...(status ? { status } : {}),
    ...(from || to
      ? {
          startAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {})
          }
        }
      : {})
  };

  const total = await prisma.reservation.count({ where });
  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      },
      user: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [{ startAt: "asc" }, { id: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  return {
    reservations: reservations.map((reservation) =>
      serializeReservation(reservation as ReservationWithRelations)
    ),
    total,
    page,
    pageSize
  };
}

function reservationInclude() {
  return {
    customer: {
      select: {
        id: true,
        name: true,
        phone: true
      }
    },
    user: {
      select: {
        id: true,
        name: true
      }
    }
  } satisfies Prisma.ReservationInclude;
}

export async function getReservation({
  reservationId,
  organizationId
}: {
  reservationId: bigint;
  organizationId: bigint;
}) {
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      organizationId,
      deletedAt: null
    },
    include: reservationInclude()
  });

  if (!reservation) {
    throw new AppError("NOT_FOUND", "예약을 찾을 수 없습니다.", 404);
  }

  return serializeReservation(reservation as ReservationWithRelations);
}

export async function createReservation({
  organizationId,
  userId,
  input
}: {
  organizationId: bigint;
  userId?: bigint;
  input: CreateReservationInput;
}) {
  const customerId = BigInt(input.customerId);

  await ensureCustomerInOrganization({ customerId, organizationId });

  const reservation = await prisma.$transaction(async (tx) => {
    const created = await tx.reservation.create({
      data: {
        organizationId,
        customerId,
        userId,
        title: input.title,
        startAt: new Date(input.startAt),
        endAt: new Date(input.endAt),
        location: input.location,
        memo: input.memo,
        status: input.status
      }
    });

    if (input.status === "scheduled" || input.status === "in_progress") {
      await tx.customer.update({
        where: {
          id: customerId
        },
        data: {
          status: "reserved"
        }
      });
    }

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        entityType: "RESERVATION",
        entityId: created.id,
        action: "RESERVATION_CREATED",
        metadata: {
          customerId: customerId.toString(),
          source: "reservation-service"
        }
      }
    });

    if (userId) {
      await tx.notification.create({
        data: {
          organizationId,
          userId,
          type: "reservation",
          title: "예약 등록",
          message: input.title,
          linkUrl: `/reservations/${created.id.toString()}`
        }
      });
    }

    return created;
  });

  const reservationWithRelations = await prisma.reservation.findUnique({
    where: {
      id: reservation.id
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      },
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!reservationWithRelations) {
    throw new AppError("NOT_FOUND", "예약을 찾을 수 없습니다.", 404);
  }

  return serializeReservation(
    reservationWithRelations as ReservationWithRelations
  );
}

function customerStatusForReservationStatus(
  status: UpdateReservationStatusInput["status"]
) {
  if (status === "scheduled" || status === "in_progress") {
    return "reserved" as const;
  }

  if (status === "completed" || status === "no_show") {
    return "completed" as const;
  }

  return null;
}

export async function updateReservationStatus({
  reservationId,
  organizationId,
  userId,
  input
}: {
  reservationId: bigint;
  organizationId: bigint;
  userId?: bigint;
  input: UpdateReservationStatusInput;
}) {
  const existing = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      organizationId,
      deletedAt: null
    },
    select: {
      id: true,
      customerId: true
    }
  });

  if (!existing) {
    throw new AppError("NOT_FOUND", "예약을 찾을 수 없습니다.", 404);
  }

  const customerStatus = customerStatusForReservationStatus(input.status);

  const reservation = await prisma.$transaction(async (tx) => {
    const updated = await tx.reservation.update({
      where: {
        id: reservationId
      },
      data: {
        status: input.status
      }
    });

    if (customerStatus) {
      await tx.customer.update({
        where: {
          id: existing.customerId
        },
        data: {
          status: customerStatus
        }
      });
    }

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        entityType: "RESERVATION",
        entityId: reservationId,
        action: "RESERVATION_STATUS_UPDATED",
        metadata: {
          customerId: existing.customerId.toString(),
          status: input.status,
          source: "reservation-service"
        }
      }
    });

    if (userId) {
      await tx.notification.create({
        data: {
          organizationId,
          userId,
          type: "reservation",
          title: "예약 상태 변경",
          message: `${updated.title}: ${input.status}`,
          linkUrl: `/reservations/${updated.id.toString()}`
        }
      });
    }

    return updated;
  });

  const reservationWithRelations = await prisma.reservation.findUnique({
    where: {
      id: reservation.id
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      },
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!reservationWithRelations) {
    throw new AppError("NOT_FOUND", "예약을 찾을 수 없습니다.", 404);
  }

  return serializeReservation(
    reservationWithRelations as ReservationWithRelations
  );
}

export async function updateReservation({
  reservationId,
  organizationId,
  userId,
  input
}: {
  reservationId: bigint;
  organizationId: bigint;
  userId?: bigint;
  input: UpdateReservationInput;
}) {
  const existing = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      organizationId,
      deletedAt: null
    },
    select: {
      id: true,
      customerId: true
    }
  });

  if (!existing) {
    throw new AppError("NOT_FOUND", "예약을 찾을 수 없습니다.", 404);
  }

  const customerStatus = customerStatusForReservationStatus(input.status);

  const reservationIdFromUpdate = await prisma.$transaction(async (tx) => {
    const updated = await tx.reservation.update({
      where: {
        id: reservationId
      },
      data: {
        title: input.title,
        startAt: new Date(input.startAt),
        endAt: new Date(input.endAt),
        location: input.location ?? null,
        memo: input.memo ?? null,
        status: input.status,
        userId
      }
    });

    if (customerStatus) {
      await tx.customer.update({
        where: {
          id: existing.customerId
        },
        data: {
          status: customerStatus
        }
      });
    }

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        entityType: "RESERVATION",
        entityId: reservationId,
        action: "RESERVATION_UPDATED",
        metadata: {
          customerId: existing.customerId.toString(),
          status: input.status,
          source: "reservation-service"
        }
      }
    });

    return updated.id;
  });

  const reservationWithRelations = await prisma.reservation.findUnique({
    where: {
      id: reservationIdFromUpdate
    },
    include: reservationInclude()
  });

  if (!reservationWithRelations) {
    throw new AppError("NOT_FOUND", "예약을 찾을 수 없습니다.", 404);
  }

  return serializeReservation(
    reservationWithRelations as ReservationWithRelations
  );
}
