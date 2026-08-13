import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type {
  CreateCustomerInput,
  ListCustomersInput,
  UpdateCustomerInput
} from "@/server/customers/validation";
import { AppError } from "@/server/shared/http-errors";

type CustomerWithTags = {
  id: bigint;
  organizationId: bigint;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: CreateCustomerInput["status"];
  memo: string | null;
  lastContactedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: Array<{
    tag: {
      id: bigint;
      name: string;
      color: string | null;
    };
  }>;
};

type ListCustomersParams = Partial<ListCustomersInput> & {
  organizationId: bigint;
};

function serializeCustomer(customer: CustomerWithTags) {
  return {
    id: customer.id.toString(),
    organizationId: customer.organizationId.toString(),
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    status: customer.status,
    memo: customer.memo,
    lastContactedAt: customer.lastContactedAt?.toISOString() ?? null,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    tags:
      customer.tags?.map(({ tag }) => ({
        id: tag.id.toString(),
        name: tag.name,
        color: tag.color
      })) ?? []
  };
}

async function ensureTagsInOrganization({
  tagIds,
  organizationId
}: {
  tagIds: bigint[];
  organizationId: bigint;
}) {
  const uniqueTagIds = [...new Set(tagIds)];

  if (uniqueTagIds.length === 0) {
    return uniqueTagIds;
  }

  const count = await prisma.tag.count({
    where: {
      id: {
        in: uniqueTagIds
      },
      organizationId
    }
  });

  if (count !== uniqueTagIds.length) {
    throw new AppError("NOT_FOUND", "태그를 찾을 수 없습니다.", 404);
  }

  return uniqueTagIds;
}

export async function listCustomers({
  organizationId,
  search,
  status,
  page = 1,
  pageSize = 20
}: ListCustomersParams) {
  const where: Prisma.CustomerWhereInput = {
    organizationId,
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
            { email: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return {
    customers: customers.map(serializeCustomer),
    total,
    page,
    pageSize
  };
}

export async function createCustomer({
  organizationId,
  userId,
  input
}: {
  organizationId: bigint;
  userId?: bigint;
  input: CreateCustomerInput;
}) {
  const tagIds = await ensureTagsInOrganization({
    tagIds: input.tagIds.map(BigInt),
    organizationId
  });
  const customer = await prisma.$transaction(async (tx) => {
    const created = await tx.customer.create({
      data: {
        organizationId,
        name: input.name,
        phone: input.phone,
        email: input.email,
        address: input.address,
        status: input.status,
        memo: input.memo
      }
    });

    if (tagIds.length > 0) {
      await tx.customerTag.createMany({
        data: tagIds.map((tagId) => ({
          customerId: created.id,
          tagId
        })),
        skipDuplicates: true
      });
    }

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        entityType: "CUSTOMER",
        entityId: created.id,
        action: "CUSTOMER_CREATED",
        metadata: {
          source: "customer-service"
        }
      }
    });

    return tx.customer.findUnique({
      where: {
        id: created.id
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  });

  if (!customer) {
    throw new AppError("NOT_FOUND", "고객을 찾을 수 없습니다.", 404);
  }

  return serializeCustomer(customer);
}

async function ensureCustomerExists({
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

export async function getCustomer({
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
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });

  if (!customer) {
    throw new AppError("NOT_FOUND", "고객을 찾을 수 없습니다.", 404);
  }

  return serializeCustomer(customer);
}

export async function updateCustomer({
  customerId,
  organizationId,
  userId,
  input
}: {
  customerId: bigint;
  organizationId: bigint;
  userId?: bigint;
  input: UpdateCustomerInput;
}) {
  await ensureCustomerExists({ customerId, organizationId });
  const { tagIds: inputTagIds, ...customerInput } = input;
  const tagIds =
    inputTagIds === undefined
      ? undefined
      : await ensureTagsInOrganization({
          tagIds: inputTagIds.map(BigInt),
          organizationId
        });

  const customer = await prisma.$transaction(async (tx) => {
    const updated = await tx.customer.update({
      where: {
        id: customerId
      },
      data: customerInput
    });

    if (tagIds) {
      await tx.customerTag.deleteMany({
        where: {
          customerId
        }
      });
      if (tagIds.length > 0) {
        await tx.customerTag.createMany({
          data: tagIds.map((tagId) => ({
            customerId,
            tagId
          })),
          skipDuplicates: true
        });
      }
    }

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        entityType: "CUSTOMER",
        entityId: updated.id,
        action: "CUSTOMER_UPDATED",
        metadata: {
          source: "customer-service"
        }
      }
    });

    return tx.customer.findUnique({
      where: {
        id: updated.id
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  });

  if (!customer) {
    throw new AppError("NOT_FOUND", "고객을 찾을 수 없습니다.", 404);
  }

  return serializeCustomer(customer);
}

export async function deleteCustomer({
  customerId,
  organizationId,
  userId
}: {
  customerId: bigint;
  organizationId: bigint;
  userId?: bigint;
}) {
  await ensureCustomerExists({ customerId, organizationId });

  await prisma.$transaction(async (tx) => {
    await tx.customer.update({
      where: {
        id: customerId
      },
      data: {
        deletedAt: new Date()
      }
    });

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        entityType: "CUSTOMER",
        entityId: customerId,
        action: "CUSTOMER_DELETED",
        metadata: {
          source: "customer-service"
        }
      }
    });
  });
}
