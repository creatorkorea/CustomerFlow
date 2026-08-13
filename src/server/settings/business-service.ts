import type { UserRole } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { UpdateBusinessSettingsInput } from "@/server/settings/business-validation";
import { AppError } from "@/server/shared/http-errors";

type BusinessSettingsRecord = {
  id: bigint;
  name: string;
  businessNumber: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  plan: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

const businessSettingsSelect = {
  id: true,
  name: true,
  businessNumber: true,
  phone: true,
  email: true,
  timezone: true,
  plan: true,
  status: true,
  createdAt: true,
  updatedAt: true
};

function serializeBusinessSettings(settings: BusinessSettingsRecord) {
  return {
    id: settings.id.toString(),
    name: settings.name,
    businessNumber: settings.businessNumber,
    phone: settings.phone,
    email: settings.email,
    timezone: settings.timezone,
    plan: settings.plan,
    status: settings.status,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString()
  };
}

export function assertCanManageBusinessSettings(role: UserRole | string) {
  if (role !== "owner" && role !== "admin") {
    throw new AppError("FORBIDDEN", "사업장 설정 권한이 필요합니다.", 403);
  }
}

export async function getBusinessSettings({
  organizationId
}: {
  organizationId: bigint;
}) {
  const settings = await prisma.organization.findUnique({
    where: {
      id: organizationId
    },
    select: businessSettingsSelect
  });

  if (!settings) {
    throw new AppError("NOT_FOUND", "사업장을 찾을 수 없습니다.", 404);
  }

  return serializeBusinessSettings(settings as BusinessSettingsRecord);
}

export async function updateBusinessSettings({
  organizationId,
  userId,
  input
}: {
  organizationId: bigint;
  userId: bigint;
  input: UpdateBusinessSettingsInput;
}) {
  try {
    const settings = await prisma.$transaction(async (tx) => {
      const updated = await tx.organization.update({
        where: {
          id: organizationId
        },
        data: {
          name: input.name,
          businessNumber: input.businessNumber ?? null,
          phone: input.phone ?? null,
          email: input.email ?? null,
          timezone: input.timezone
        },
        select: businessSettingsSelect
      });

      await tx.activityLog.create({
        data: {
          organizationId,
          userId,
          entityType: "ORGANIZATION",
          entityId: organizationId,
          action: "ORGANIZATION_UPDATED",
          metadata: {
            source: "business-settings-service"
          }
        }
      });

      return updated;
    });

    return serializeBusinessSettings(settings as BusinessSettingsRecord);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "DUPLICATE_RESOURCE",
        "이미 사용 중인 사업자등록번호입니다.",
        409
      );
    }

    throw error;
  }
}
