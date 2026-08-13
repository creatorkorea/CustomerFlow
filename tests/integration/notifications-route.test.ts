import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireUser: vi.fn()
}));

vi.mock("@/server/notifications/service", () => ({
  listNotifications: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  markNotificationRead: vi.fn()
}));

import { GET, PATCH } from "@/app/api/notifications/route";
import { requireUser } from "@/server/auth/session";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "@/server/notifications/service";

const sessionUser = {
  id: "3",
  email: "owner@example.com",
  name: "Owner",
  role: "owner",
  organizationId: "7"
};

describe("/api/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the session organization and user when listing notifications", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(sessionUser);
    vi.mocked(listNotifications).mockResolvedValueOnce({
      notifications: [],
      total: 0,
      unreadCount: 0,
      page: 1,
      pageSize: 20
    });

    const response = await GET(
      new Request("http://localhost/api/notifications?unreadOnly=true")
    );

    expect(response.status).toBe(200);
    expect(listNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 7n,
        userId: 3n,
        unreadOnly: true
      })
    );
  });

  it("marks one notification as read from the session tenant only", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(sessionUser);
    vi.mocked(markNotificationRead).mockResolvedValueOnce({
      id: "51",
      organizationId: "7",
      userId: "3",
      type: "follow_up",
      title: "후속관리 등록",
      message: "예약 전 확인 연락",
      linkUrl: "/follow-ups?customerId=21",
      readAt: "2026-08-13T01:00:00.000Z",
      createdAt: "2026-08-13T00:00:00.000Z"
    });

    const response = await PATCH(
      new Request("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ notificationId: "51" })
      })
    );

    expect(response.status).toBe(200);
    expect(markNotificationRead).toHaveBeenCalledWith({
      organizationId: 7n,
      userId: 3n,
      notificationId: "51"
    });
  });

  it("marks all notifications as read when explicitly requested", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(sessionUser);
    vi.mocked(markAllNotificationsRead).mockResolvedValueOnce({
      count: 2
    });

    const response = await PATCH(
      new Request("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ all: true })
      })
    );

    expect(response.status).toBe(200);
    expect(markAllNotificationsRead).toHaveBeenCalledWith({
      organizationId: 7n,
      userId: 3n
    });
  });

  it("rejects invalid mark-read payloads before updating records", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(sessionUser);

    const response = await PATCH(
      new Request("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ notificationId: "abc" })
      })
    );

    expect(response.status).toBe(400);
    expect(markNotificationRead).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR"
      }
    });
  });
});
