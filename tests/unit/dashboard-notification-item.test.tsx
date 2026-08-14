import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardNotificationItem } from "@/app/(app)/dashboard/dashboard-notification-item";

const baseNotification = {
  id: "notification-1",
  type: "follow_up",
  title: "후속관리 예정",
  message: "예약 전 확인 연락이 필요합니다.",
  createdAtLabel: "2026. 8. 14. 오후 3:00"
};

describe("DashboardNotificationItem", () => {
  it("labels linked notification actions as related screens", () => {
    render(
      <DashboardNotificationItem
        markReadAction={async () => {}}
        notification={{
          ...baseNotification,
          linkUrl: "/follow-ups/1"
        }}
      />
    );

    expect(screen.getByRole("link", { name: "관련 화면" })).toHaveAttribute(
      "href",
      "/follow-ups/1"
    );
  });

  it("labels notifications without destinations as the notification list", () => {
    render(
      <DashboardNotificationItem
        markReadAction={async () => {}}
        notification={{
          ...baseNotification,
          linkUrl: null
        }}
      />
    );

    expect(screen.queryByRole("link", { name: "관련 화면" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "전체 알림" })).toHaveAttribute(
      "href",
      "/notifications"
    );
  });
});
