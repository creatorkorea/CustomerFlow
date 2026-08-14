import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type {
  CreateFollowUpInput,
  ListFollowUpsInput,
  UpdateFollowUpStatusInput
} from "@/server/follow-ups/validation";
import { AppError } from "@/server/shared/http-errors";

type FollowUpWithRelations = {
  id: bigint;
  organizationId: bigint;
  customerId: bigint;
  consultationId: bigint | null;
  userId: bigint | null;
  title: string;
  memo: string | null;
  dueAt: Date;
  status: CreateFollowUpInput["status"];
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: bigint;
    name: string;
    phone: string | null;
  };
  consultation: {
    id: bigint;
    content: string;
  } | null;
  user: {
    id: bigint;
    name: string;
  } | null;
};

type ListFollowUpsParams = Partial<ListFollowUpsInput> & {
  organizationId: bigint;
};

function serializeFollowUp(followUp: FollowUpWithRelations) {
  return {
    id: followUp.id.toString(),
    organizationId: followUp.organizationId.toString(),
    customerId: followUp.customerId.toString(),
    customerName: followUp.customer.name,
    customerPhone: followUp.customer.phone,
    consultationId: followUp.consultationId?.toString() ?? null,
    consultationContent: followUp.consultation?.content ?? null,
    userId: followUp.userId?.toString() ?? null,
    userName: followUp.user?.name ?? null,
    title: followUp.title,
    memo: followUp.memo,
    dueAt: followUp.dueAt.toISOString(),
    status: followUp.status,
    completedAt: followUp.completedAt?.toISOString() ?? null,
    createdAt: followUp.createdAt.toISOString(),
    updatedAt: followUp.updatedAt.toISOString()
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

async function ensureConsultationInOrganization({
  consultationId,
  customerId,
  organizationId
}: {
  consultationId: bigint;
  customerId: bigint;
  organizationId: bigint;
}) {
  const consultation = await prisma.consultation.findFirst({
    where: {
      id: consultationId,
      customerId,
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
}

export async function listFollowUps({
  organizationId,
  customerId,
  status,
  from,
  to,
  page = 1,
  pageSize = 20
}: ListFollowUpsParams) {
  if (customerId) {
    await ensureCustomerInOrganization({
      customerId: BigInt(customerId),
      organizationId
    });
  }

  const where: Prisma.FollowUpWhereInput = {
    organizationId,
    deletedAt: null,
    ...(customerId ? { customerId: BigInt(customerId) } : {}),
    ...(status ? { status } : {}),
    ...(from || to
      ? {
          dueAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {})
          }
        }
      : {})
  };

  const total = await prisma.followUp.count({ where });
  const followUps = await prisma.followUp.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      },
      consultation: {
        select: {
          id: true,
          content: true
        }
      },
      user: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [{ dueAt: "asc" }, { id: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  return {
    followUps: followUps.map((followUp) =>
      serializeFollowUp(followUp as FollowUpWithRelations)
    ),
    total,
    page,
    pageSize
  };
}

export async function createFollowUp({
  organizationId,
  userId,
  input
}: {
  organizationId: bigint;
  userId?: bigint;
  input: CreateFollowUpInput;
}) {
  const customerId = BigInt(input.customerId);
  const consultationId = input.consultationId
    ? BigInt(input.consultationId)
    : undefined;

  await ensureCustomerInOrganization({ customerId, organizationId });

  if (consultationId) {
    await ensureConsultationInOrganization({
      consultationId,
      customerId,
      organizationId
    });
  }

  const followUp = await prisma.$transaction(async (tx) => {
    const created = await tx.followUp.create({
      data: {
        organizationId,
        customerId,
        consultationId,
        userId,
        title: input.title,
        memo: input.memo,
        dueAt: new Date(input.dueAt),
        status: input.status,
        completedAt: input.status === "completed" ? new Date() : undefined
      }
    });

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        entityType: "FOLLOW_UP",
        entityId: created.id,
        action: "FOLLOW_UP_CREATED",
        metadata: {
          customerId: customerId.toString(),
          consultationId: consultationId?.toString(),
          source: "follow-up-service"
        }
      }
    });

    if (userId) {
      await tx.notification.create({
        data: {
          organizationId,
          userId,
          type: "follow_up",
          title: "후속관리 등록",
          message: input.title,
          linkUrl: `/follow-ups?customerId=${customerId.toString()}`
        }
      });
    }

    return created;
  });

  const followUpWithRelations = await prisma.followUp.findUnique({
    where: {
      id: followUp.id
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      },
      consultation: {
        select: {
          id: true,
          content: true
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

  if (!followUpWithRelations) {
    throw new AppError("NOT_FOUND", "후속관리를 찾을 수 없습니다.", 404);
  }

  return serializeFollowUp(followUpWithRelations as FollowUpWithRelations);
}

export async function updateFollowUpStatus({
  followUpId,
  organizationId,
  userId,
  input
}: {
  followUpId: bigint;
  organizationId: bigint;
  userId?: bigint;
  input: UpdateFollowUpStatusInput;
}) {
  const existing = await prisma.followUp.findFirst({
    where: {
      id: followUpId,
      organizationId,
      deletedAt: null
    },
    select: {
      id: true,
      customerId: true
    }
  });

  if (!existing) {
    throw new AppError("NOT_FOUND", "후속관리를 찾을 수 없습니다.", 404);
  }

  const completedAt = input.status === "completed" ? new Date() : null;

  const followUp = await prisma.$transaction(async (tx) => {
    const updated = await tx.followUp.update({
      where: {
        id: followUpId
      },
      data: {
        status: input.status,
        completedAt
      }
    });

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        entityType: "FOLLOW_UP",
        entityId: followUpId,
        action: "FOLLOW_UP_STATUS_UPDATED",
        metadata: {
          customerId: existing.customerId.toString(),
          status: input.status,
          source: "follow-up-service"
        }
      }
    });

    if (userId) {
      await tx.notification.create({
        data: {
          organizationId,
          userId,
          type: "follow_up",
          title: "후속관리 상태 변경",
          message: `${updated.title}: ${input.status}`,
          linkUrl: `/follow-ups?customerId=${existing.customerId.toString()}`
        }
      });
    }

    return updated;
  });

  const followUpWithRelations = await prisma.followUp.findUnique({
    where: {
      id: followUp.id
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true
        }
      },
      consultation: {
        select: {
          id: true,
          content: true
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

  if (!followUpWithRelations) {
    throw new AppError("NOT_FOUND", "후속관리를 찾을 수 없습니다.", 404);
  }

  return serializeFollowUp(followUpWithRelations as FollowUpWithRelations);
}
