import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    tag: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn()
    },
    activityLog: {
      create: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

import { prisma } from "@/lib/db";
import { createTag, listTags } from "@/server/tags/service";

describe("tag service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists tags for the current organization", async () => {
    vi.mocked(prisma.tag.count).mockResolvedValueOnce(1);
    vi.mocked(prisma.tag.findMany).mockResolvedValueOnce([
      {
        id: 11n,
        organizationId: 7n,
        name: "VIP",
        color: "#0f766e",
        createdAt: new Date("2026-08-13T00:00:00.000Z"),
        updatedAt: new Date("2026-08-13T00:00:00.000Z")
      }
    ] as never);

    const result = await listTags({
      organizationId: 7n
    });

    expect(prisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 7n
        }
      })
    );
    expect(result).toMatchObject({
      total: 1,
      tags: [
        {
          id: "11",
          name: "VIP",
          color: "#0f766e"
        }
      ]
    });
  });

  it("creates a tag in the current organization and records activity", async () => {
    const activityCreate = vi.fn();

    vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
      callback({
        tag: {
          create: vi.fn().mockResolvedValueOnce({
            id: 21n,
            organizationId: 7n,
            name: "긴급",
            color: "#dc2626",
            createdAt: new Date("2026-08-13T00:00:00.000Z"),
            updatedAt: new Date("2026-08-13T00:00:00.000Z")
          })
        },
        activityLog: {
          create: activityCreate
        }
      } as never)
    );

    const result = await createTag({
      organizationId: 7n,
      userId: 3n,
      input: {
        name: "긴급",
        color: "#dc2626"
      }
    });

    expect(activityCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 7n,
          userId: 3n,
          entityType: "TAG",
          action: "TAG_CREATED"
        })
      })
    );
    expect(result).toMatchObject({
      id: "21",
      organizationId: "7",
      name: "긴급"
    });
  });
});
