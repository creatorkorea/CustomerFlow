import { prisma } from "@/lib/db";

type DashboardOverviewParams = {
  organizationId: bigint;
  now?: Date;
};

type TodayReservation = {
  id: bigint;
  customerId: bigint;
  title: string;
  startAt: Date;
  endAt: Date;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
  customer: {
    name: string;
    phone: string | null;
  };
};

type PendingFollowUp = {
  id: bigint;
  customerId: bigint;
  title: string;
  dueAt: Date;
  status: "pending" | "completed" | "cancelled";
  customer: {
    name: string;
    phone: string | null;
  };
};

type RecentActivity = {
  id: bigint;
  entityType: string;
  entityId: bigint | null;
  action: string;
  createdAt: Date;
  user: {
    name: string;
  } | null;
};

function getKstDayRange(now: Date) {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffsetMs);
  const startUtc = Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate()
  );

  return {
    gte: new Date(startUtc - kstOffsetMs),
    lt: new Date(startUtc + 24 * 60 * 60 * 1000 - kstOffsetMs)
  };
}

function serializeReservation(reservation: TodayReservation) {
  return {
    id: reservation.id.toString(),
    customerId: reservation.customerId.toString(),
    customerName: reservation.customer.name,
    customerPhone: reservation.customer.phone,
    title: reservation.title,
    startAt: reservation.startAt.toISOString(),
    endAt: reservation.endAt.toISOString(),
    status: reservation.status
  };
}

function serializeFollowUp(followUp: PendingFollowUp) {
  return {
    id: followUp.id.toString(),
    customerId: followUp.customerId.toString(),
    customerName: followUp.customer.name,
    customerPhone: followUp.customer.phone,
    title: followUp.title,
    dueAt: followUp.dueAt.toISOString(),
    status: followUp.status
  };
}

function serializeActivity(activity: RecentActivity) {
  return {
    id: activity.id.toString(),
    entityType: activity.entityType,
    entityId: activity.entityId?.toString() ?? null,
    action: activity.action,
    userName: activity.user?.name ?? null,
    createdAt: activity.createdAt.toISOString()
  };
}

export async function getDashboardOverview({
  organizationId,
  now = new Date()
}: DashboardOverviewParams) {
  const todayRange = getKstDayRange(now);

  const todayReservations = await prisma.reservation.count({
    where: {
      organizationId,
      deletedAt: null,
      status: {
        in: ["scheduled", "in_progress"]
      },
      startAt: todayRange
    }
  });
  const newCustomers = await prisma.customer.count({
    where: {
      organizationId,
      deletedAt: null,
      createdAt: todayRange
    }
  });
  const pendingFollowUps = await prisma.followUp.count({
    where: {
      organizationId,
      deletedAt: null,
      status: "pending",
      dueAt: {
        lt: todayRange.lt
      }
    }
  });
  const openConsultations = await prisma.consultation.count({
    where: {
      organizationId,
      deletedAt: null,
      status: {
        in: ["new", "consulting", "quote", "reserved", "on_hold"]
      }
    }
  });
  const unreadNotifications = await prisma.notification.count({
    where: {
      organizationId,
      readAt: null
    }
  });
  const reservationQueue = await prisma.reservation.findMany({
      where: {
        organizationId,
        deletedAt: null,
        status: {
          in: ["scheduled", "in_progress"]
        },
        startAt: todayRange
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: [{ startAt: "asc" }, { id: "desc" }],
      take: 5
    });
  const followUpQueue = await prisma.followUp.findMany({
    where: {
      organizationId,
      deletedAt: null,
      status: "pending",
      dueAt: {
        lt: todayRange.lt
      }
    },
    include: {
      customer: {
        select: {
          name: true,
          phone: true
        }
      }
    },
    orderBy: [{ dueAt: "asc" }, { id: "desc" }],
    take: 5
  });
  const recentActivities = await prisma.activityLog.findMany({
    where: {
      organizationId
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 6
  });

  return {
    metrics: {
      todayReservations,
      newCustomers,
      pendingFollowUps,
      openConsultations,
      unreadNotifications
    },
    todayReservations: reservationQueue.map((reservation) =>
      serializeReservation(reservation as TodayReservation)
    ),
    pendingFollowUps: followUpQueue.map((followUp) =>
      serializeFollowUp(followUp as PendingFollowUp)
    ),
    recentActivities: recentActivities.map((activity) =>
      serializeActivity(activity as RecentActivity)
    )
  };
}
