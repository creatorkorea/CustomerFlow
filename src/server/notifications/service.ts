import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { ListNotificationsInput } from "@/server/notifications/validation";
import { AppError } from "@/server/shared/http-errors";

type NotificationRecord = {
  id: bigint;
  organizationId: bigint;
  userId: bigint;
  type: string;
  title: string;
  message: string;
  linkUrl: string | null;
  readAt: Date | null;
  createdAt: Date;
};

type ListNotificationsParams = Partial<ListNotificationsInput> & {
  organizationId: bigint;
  userId: bigint;
};

function serializeNotification(notification: NotificationRecord) {
  return {
    id: notification.id.toString(),
    organizationId: notification.organizationId.toString(),
    userId: notification.userId.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    linkUrl: notification.linkUrl,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString()
  };
}

export async function listNotifications({
  organizationId,
  userId,
  unreadOnly,
  page = 1,
  pageSize = 20
}: ListNotificationsParams) {
  const where: Prisma.NotificationWhereInput = {
    organizationId,
    userId,
    ...(unreadOnly ? { readAt: null } : {})
  };
  const unreadWhere: Prisma.NotificationWhereInput = {
    organizationId,
    userId,
    readAt: null
  };

  const total = await prisma.notification.count({ where });
  const unreadCount = await prisma.notification.count({ where: unreadWhere });
  const notifications = await prisma.notification.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  return {
    notifications: notifications.map((notification) =>
      serializeNotification(notification as NotificationRecord)
    ),
    total,
    unreadCount,
    page,
    pageSize
  };
}

export async function getUnreadNotificationCount({
  organizationId,
  userId
}: {
  organizationId: bigint;
  userId: bigint;
}) {
  return prisma.notification.count({
    where: {
      organizationId,
      userId,
      readAt: null
    }
  });
}

export async function markNotificationRead({
  organizationId,
  userId,
  notificationId
}: {
  organizationId: bigint;
  userId: bigint;
  notificationId: string;
}) {
  const id = BigInt(notificationId);
  const notification = await prisma.notification.findFirst({
    where: {
      id,
      organizationId,
      userId
    },
    select: {
      id: true
    }
  });

  if (!notification) {
    throw new AppError("NOT_FOUND", "알림을 찾을 수 없습니다.", 404);
  }

  const updated = await prisma.notification.update({
    where: {
      id
    },
    data: {
      readAt: new Date()
    }
  });

  return serializeNotification(updated as NotificationRecord);
}

export async function markAllNotificationsRead({
  organizationId,
  userId
}: {
  organizationId: bigint;
  userId: bigint;
}) {
  const result = await prisma.notification.updateMany({
    where: {
      organizationId,
      userId,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });

  return {
    count: result.count
  };
}
