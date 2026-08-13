import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    organization: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    activityLog: {
      create: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

import { prisma } from "@/lib/db";
import {
  assertCanManageBusinessSettings,
  getBusinessSettings,
  updateBusinessSettings
} from "@/server/settings/business-service";

describe("business settings service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets the current organization business profile", async () => {
    vi.mocked(prisma.organization.findUnique).mockResolvedValueOnce({
      id: 7n,
      name: "CustomerFlow Demo",
      businessNumber: "000-00-00000",
      phone: "02-1234-5678",
      email: "hello@example.com",
      timezone: "Asia/Seoul",
      plan: "free",
      status: "active",
      createdAt: new Date("2026-08-13T00:00:00.000Z"),
      updatedAt: new Date("2026-08-13T01:00:00.000Z")
    } as never);

    const result = await getBusinessSettings({
      organizationId: 7n
    });

    expect(prisma.organization.findUnique).toHaveBeenCalledWith({
      where: {
        id: 7n
      },
      select: expect.any(Object)
    });
    expect(result).toMatchObject({
      id: "7",
      name: "CustomerFlow Demo",
      businessNumber: "000-00-00000",
      phone: "02-1234-5678",
      email: "hello@example.com",
      timezone: "Asia/Seoul"
    });
  });

  it("updates the current organization and logs the activity", async () => {
    const activityCreate = vi.fn();

    vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
      callback({
        organization: {
          update: vi.fn().mockResolvedValueOnce({
            id: 7n,
            name: "새 상호",
            businessNumber: null,
            phone: "02-5555-0000",
            email: "team@example.com",
            timezone: "Asia/Seoul",
            plan: "free",
            status: "active",
            createdAt: new Date("2026-08-13T00:00:00.000Z"),
            updatedAt: new Date("2026-08-13T01:00:00.000Z")
          })
        },
        activityLog: {
          create: activityCreate
        }
      } as never)
    );

    const result = await updateBusinessSettings({
      organizationId: 7n,
      userId: 3n,
      input: {
        name: "새 상호",
        businessNumber: null,
        phone: "02-5555-0000",
        email: "team@example.com",
        timezone: "Asia/Seoul"
      }
    });

    expect(activityCreate).toHaveBeenCalledWith({
      data: {
        organizationId: 7n,
        userId: 3n,
        entityType: "ORGANIZATION",
        entityId: 7n,
        action: "ORGANIZATION_UPDATED",
        metadata: {
          source: "business-settings-service"
        }
      }
    });
    expect(result).toMatchObject({
      id: "7",
      name: "새 상호",
      businessNumber: null
    });
  });

  it("rejects staff users from managing business settings", () => {
    expect(() => assertCanManageBusinessSettings("staff")).toThrow(
      "사업장 설정 권한이 필요합니다."
    );
    expect(() => assertCanManageBusinessSettings("admin")).not.toThrow();
    expect(() => assertCanManageBusinessSettings("owner")).not.toThrow();
  });
});
