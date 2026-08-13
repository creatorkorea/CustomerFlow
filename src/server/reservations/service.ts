import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type {
  CreateReservationInput,
  ListReservationsInput,
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

  const [total, reservations] = await Promise.all([
    prisma.reservation.count({ where }),
    prisma.reservation.findMany({
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
    })
  ]);

  return {
    reservations: reservations.map((reservation) =>
      serializeReservation(reservation as ReservationWithRelations)
    ),
    total,
    page,
    pageSize
  };
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

    return created;
  });

  return serializeReservation(reservation as ReservationWithRelations);
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

    return updated;
  });

  return serializeReservation(reservation as ReservationWithRelations);
}
