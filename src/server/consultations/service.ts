import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type {
  CreateConsultationInput,
  ListConsultationsInput,
  UpdateConsultationInput
} from "@/server/consultations/validation";
import { AppError } from "@/server/shared/http-errors";

type ConsultationWithRelations = {
  id: bigint;
  organizationId: bigint;
  customerId: bigint;
  userId: bigint | null;
  channel: CreateConsultationInput["channel"];
  type: CreateConsultationInput["type"];
  status: CreateConsultationInput["status"];
  content: string;
  result: string | null;
  nextAction: string | null;
  followUpAt: Date | null;
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

type ListConsultationsParams = Partial<ListConsultationsInput> & {
  organizationId: bigint;
};

function serializeConsultation(consultation: ConsultationWithRelations) {
  return {
    id: consultation.id.toString(),
    organizationId: consultation.organizationId.toString(),
    customerId: consultation.customerId.toString(),
    customerName: consultation.customer.name,
    customerPhone: consultation.customer.phone,
    userId: consultation.userId?.toString() ?? null,
    userName: consultation.user?.name ?? null,
    channel: consultation.channel,
    type: consultation.type,
    status: consultation.status,
    content: consultation.content,
    result: consultation.result,
    nextAction: consultation.nextAction,
    followUpAt: consultation.followUpAt?.toISOString() ?? null,
    createdAt: consultation.createdAt.toISOString(),
    updatedAt: consultation.updatedAt.toISOString()
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

export async function listConsultations({
  organizationId,
  customerId,
  status,
  channel,
  page = 1,
  pageSize = 20
}: ListConsultationsParams) {
  if (customerId) {
    await ensureCustomerInOrganization({
      customerId: BigInt(customerId),
      organizationId
    });
  }

  const where: Prisma.ConsultationWhereInput = {
    organizationId,
    deletedAt: null,
    ...(customerId ? { customerId: BigInt(customerId) } : {}),
    ...(status ? { status } : {}),
    ...(channel ? { channel } : {})
  };

  const total = await prisma.consultation.count({ where });
  const consultations = await prisma.consultation.findMany({
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
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  return {
    consultations: consultations.map((consultation) =>
      serializeConsultation(consultation as ConsultationWithRelations)
    ),
    total,
    page,
    pageSize
  };
}

export async function getConsultation({
  consultationId,
  organizationId
}: {
  consultationId: bigint;
  organizationId: bigint;
}) {
  const consultation = await prisma.consultation.findFirst({
    where: {
      id: consultationId,
      organizationId,
      deletedAt: null
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

  if (!consultation) {
    throw new AppError("NOT_FOUND", "상담을 찾을 수 없습니다.", 404);
  }

  return serializeConsultation(consultation as ConsultationWithRelations);
}

export async function createConsultation({
  organizationId,
  userId,
  input
}: {
  organizationId: bigint;
  userId?: bigint;
  input: CreateConsultationInput;
}) {
  const customerId = BigInt(input.customerId);

  await ensureCustomerInOrganization({ customerId, organizationId });

  const consultation = await prisma.$transaction(async (tx) => {
    const created = await tx.consultation.create({
      data: {
        organizationId,
        customerId,
        userId,
        channel: input.channel,
        type: input.type,
        status: input.status,
        content: input.content,
        result: input.result,
        nextAction: input.nextAction,
        followUpAt: input.followUpAt ? new Date(input.followUpAt) : undefined
      }
    });

    await tx.customer.update({
      where: {
        id: customerId
      },
      data: {
        lastContactedAt: created.createdAt,
        status: "consulting"
      }
    });

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        entityType: "CONSULTATION",
        entityId: created.id,
        action: "CONSULTATION_CREATED",
        metadata: {
          customerId: customerId.toString(),
          source: "consultation-service"
        }
      }
    });

    return created;
  });

  const consultationWithRelations = await prisma.consultation.findUnique({
    where: {
      id: consultation.id
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

  if (!consultationWithRelations) {
    throw new AppError("NOT_FOUND", "상담을 찾을 수 없습니다.", 404);
  }

  return serializeConsultation(
    consultationWithRelations as ConsultationWithRelations
  );
}

export async function updateConsultation({
  consultationId,
  organizationId,
  userId,
  input
}: {
  consultationId: bigint;
  organizationId: bigint;
  userId?: bigint;
  input: UpdateConsultationInput;
}) {
  const consultation = await prisma.consultation.findFirst({
    where: {
      id: consultationId,
      organizationId,
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  if (!consultation) {
    throw new AppError("NOT_FOUND", "상담을 찾을 수 없습니다.", 404);
  }

  const updated = await prisma.consultation.update({
    where: {
      id: consultationId
    },
    data: {
      status: input.status,
      result: input.result ?? null,
      nextAction: input.nextAction ?? null,
      userId
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

  return serializeConsultation(updated as ConsultationWithRelations);
}
