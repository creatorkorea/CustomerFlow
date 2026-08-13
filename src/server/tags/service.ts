import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { CreateTagInput, ListTagsInput } from "@/server/tags/validation";

type TagRecord = {
  id: bigint;
  organizationId: bigint;
  name: string;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ListTagsParams = Partial<ListTagsInput> & {
  organizationId: bigint;
};

function serializeTag(tag: TagRecord) {
  return {
    id: tag.id.toString(),
    organizationId: tag.organizationId.toString(),
    name: tag.name,
    color: tag.color,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString()
  };
}

export async function listTags({
  organizationId,
  search,
  page = 1,
  pageSize = 50
}: ListTagsParams) {
  const where: Prisma.TagWhereInput = {
    organizationId,
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
  };

  const [total, tags] = await Promise.all([
    prisma.tag.count({ where }),
    prisma.tag.findMany({
      where,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return {
    tags: tags.map((tag) => serializeTag(tag as TagRecord)),
    total,
    page,
    pageSize
  };
}

export async function createTag({
  organizationId,
  userId,
  input
}: {
  organizationId: bigint;
  userId?: bigint;
  input: CreateTagInput;
}) {
  const tag = await prisma.$transaction(async (tx) => {
    const created = await tx.tag.create({
      data: {
        organizationId,
        name: input.name,
        color: input.color
      }
    });

    await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        entityType: "TAG",
        entityId: created.id,
        action: "TAG_CREATED",
        metadata: {
          source: "tag-service"
        }
      }
    });

    return created;
  });

  return serializeTag(tag as TagRecord);
}
