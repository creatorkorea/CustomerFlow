import { prisma } from "@/lib/db";

type ListCustomerTimelineParams = {
  organizationId: bigint;
  customerId: bigint;
};

type ConsultationRecord = {
  id: bigint;
  channel: string;
  status: string;
  content: string;
  result: string | null;
  nextAction: string | null;
  createdAt: Date;
  user: {
    name: string;
  } | null;
};

type ReservationRecord = {
  id: bigint;
  title: string;
  status: string;
  startAt: Date;
  endAt: Date;
  location: string | null;
  createdAt: Date;
  user: {
    name: string;
  } | null;
};

type FollowUpRecord = {
  id: bigint;
  title: string;
  status: string;
  dueAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  user: {
    name: string;
  } | null;
};

function serializeConsultation(consultation: ConsultationRecord) {
  return {
    id: `consultation-${consultation.id.toString()}`,
    type: "consultation" as const,
    title: consultation.content,
    description: consultation.result ?? consultation.nextAction ?? null,
    status: consultation.status,
    occurredAt: consultation.createdAt.toISOString(),
    userName: consultation.user?.name ?? null,
    metadata: {
      channel: consultation.channel
    }
  };
}

function serializeReservation(reservation: ReservationRecord) {
  return {
    id: `reservation-${reservation.id.toString()}`,
    type: "reservation" as const,
    title: reservation.title,
    description: reservation.location,
    status: reservation.status,
    occurredAt: reservation.startAt.toISOString(),
    userName: reservation.user?.name ?? null,
    metadata: {
      endAt: reservation.endAt.toISOString()
    }
  };
}

function serializeFollowUp(followUp: FollowUpRecord) {
  return {
    id: `follow-up-${followUp.id.toString()}`,
    type: "followUp" as const,
    title: followUp.title,
    description: followUp.completedAt
      ? `완료 ${followUp.completedAt.toISOString()}`
      : null,
    status: followUp.status,
    occurredAt: followUp.dueAt.toISOString(),
    userName: followUp.user?.name ?? null,
    metadata: {
      createdAt: followUp.createdAt.toISOString()
    }
  };
}

export async function listCustomerTimeline({
  organizationId,
  customerId
}: ListCustomerTimelineParams) {
  const consultations = await prisma.consultation.findMany({
    where: {
      organizationId,
      customerId,
      deletedAt: null
    },
    select: {
      id: true,
      channel: true,
      status: true,
      content: true,
      result: true,
      nextAction: true,
      createdAt: true,
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 20
  });
  const reservations = await prisma.reservation.findMany({
    where: {
      organizationId,
      customerId,
      deletedAt: null
    },
    select: {
      id: true,
      title: true,
      status: true,
      startAt: true,
      endAt: true,
      location: true,
      createdAt: true,
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: [{ startAt: "desc" }, { id: "desc" }],
    take: 20
  });
  const followUps = await prisma.followUp.findMany({
    where: {
      organizationId,
      customerId,
      deletedAt: null
    },
    select: {
      id: true,
      title: true,
      status: true,
      dueAt: true,
      completedAt: true,
      createdAt: true,
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: [{ dueAt: "desc" }, { id: "desc" }],
    take: 20
  });

  return [
    ...consultations.map((consultation) =>
      serializeConsultation(consultation as ConsultationRecord)
    ),
    ...reservations.map((reservation) =>
      serializeReservation(reservation as ReservationRecord)
    ),
    ...followUps.map((followUp) => serializeFollowUp(followUp as FollowUpRecord))
  ]
    .sort(
      (first, second) =>
        new Date(second.occurredAt).getTime() -
        new Date(first.occurredAt).getTime()
    )
    .slice(0, 30);
}
