import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("@/server/auth/session", () => ({
  requireUser: vi.fn()
}));

vi.mock("@/server/notifications/service", () => ({
  markAllNotificationsRead: vi.fn(),
  markNotificationRead: vi.fn()
}));

import { revalidatePath } from "next/cache";

import { requireUser } from "@/server/auth/session";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction
} from "@/server/notifications/actions";
import {
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

describe("notification actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks one notification read from the session tenant and refreshes notification surfaces", async () => {
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

    const formData = new FormData();
    formData.set("notificationId", "51");

    await markNotificationReadAction(formData);

    expect(markNotificationRead).toHaveBeenCalledWith({
      organizationId: 7n,
      userId: 3n,
      notificationId: "51"
    });
    expect(revalidatePath).toHaveBeenCalledWith("/notifications");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/(app)", "layout");
  });

  it("marks all notifications read from the session tenant and refreshes notification surfaces", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(sessionUser);
    vi.mocked(markAllNotificationsRead).mockResolvedValueOnce({ count: 2 });

    await markAllNotificationsReadAction();

    expect(markAllNotificationsRead).toHaveBeenCalledWith({
      organizationId: 7n,
      userId: 3n
    });
    expect(revalidatePath).toHaveBeenCalledWith("/notifications");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/(app)", "layout");
  });
});
