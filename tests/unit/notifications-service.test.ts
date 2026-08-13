import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    notification: {
      count: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn()
    }
  }
}));

import { prisma } from "@/lib/db";
import {
  listNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead
} from "@/server/notifications/service";

describe("notification service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists notifications only for the current organization and user", async () => {
    vi.mocked(prisma.notification.count)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);
    vi.mocked(prisma.notification.findMany).mockResolvedValueOnce([
      {
        id: 51n,
        organizationId: 7n,
        userId: 3n,
        type: "follow_up",
        title: "후속관리 등록",
        message: "예약 전 확인 연락",
        linkUrl: "/follow-ups?customerId=21",
        readAt: null,
        createdAt: new Date("2026-08-13T00:00:00.000Z")
      }
    ] as never);

    const result = await listNotifications({
      organizationId: 7n,
      userId: 3n,
      unreadOnly: true
    });

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: 7n,
          userId: 3n,
          readAt: null
        }
      })
    );
    expect(result).toMatchObject({
      total: 1,
      unreadCount: 1,
      notifications: [
        {
          id: "51",
          organizationId: "7",
          userId: "3",
          type: "follow_up",
          title: "후속관리 등록",
          message: "예약 전 확인 연락",
          linkUrl: "/follow-ups?customerId=21",
          readAt: null
        }
      ]
    });
  });

  it("marks one notification as read only after organization and user ownership match", async () => {
    vi.mocked(prisma.notification.findFirst).mockResolvedValueOnce({
      id: 51n
    } as never);
    vi.mocked(prisma.notification.update).mockResolvedValueOnce({
      id: 51n,
      organizationId: 7n,
      userId: 3n,
      type: "follow_up",
      title: "후속관리 등록",
      message: "예약 전 확인 연락",
      linkUrl: null,
      readAt: new Date("2026-08-13T01:00:00.000Z"),
      createdAt: new Date("2026-08-13T00:00:00.000Z")
    } as never);

    await markNotificationRead({
      organizationId: 7n,
      userId: 3n,
      notificationId: "51"
    });

    expect(prisma.notification.findFirst).toHaveBeenCalledWith({
      where: {
        id: 51n,
        organizationId: 7n,
        userId: 3n
      },
      select: {
        id: true
      }
    });
    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 51n
        },
        data: {
          readAt: expect.any(Date)
        }
      })
    );
  });

  it("marks all unread notifications for the current organization and user", async () => {
    vi.mocked(prisma.notification.updateMany).mockResolvedValueOnce({
      count: 2
    });

    const result = await markAllNotificationsRead({
      organizationId: 7n,
      userId: 3n
    });

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: {
        organizationId: 7n,
        userId: 3n,
        readAt: null
      },
      data: {
        readAt: expect.any(Date)
      }
    });
    expect(result).toEqual({ count: 2 });
  });

  it("counts unread notifications for the current organization and user", async () => {
    vi.mocked(prisma.notification.count).mockResolvedValueOnce(4);

    const result = await getUnreadNotificationCount({
      organizationId: 7n,
      userId: 3n
    });

    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: {
        organizationId: 7n,
        userId: 3n,
        readAt: null
      }
    });
    expect(result).toBe(4);
  });
});
