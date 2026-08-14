import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardActivityItem } from "@/app/(app)/dashboard/dashboard-activity-item";

const baseActivity = {
  id: "activity-1",
  actionLabel: "고객 생성",
  entityLabel: "고객",
  userName: "홍길동",
  createdAtLabel: "2026. 8. 14. 오후 2:30"
};

describe("DashboardActivityItem", () => {
  it("renders linked activities as navigation links", () => {
    render(
      <DashboardActivityItem
        activity={{
          ...baseActivity,
          href: "/customers/1"
        }}
      />
    );

    expect(screen.getByRole("link", { name: /고객 생성/ })).toHaveAttribute(
      "href",
      "/customers/1"
    );
  });

  it("renders activities without destinations as non-clickable items", () => {
    const { container } = render(
      <DashboardActivityItem
        activity={{
          ...baseActivity,
          href: null
        }}
      />
    );

    expect(screen.queryByRole("link", { name: /고객 생성/ })).not.toBeInTheDocument();
    expect(container.querySelector("[aria-disabled]")).not.toBeInTheDocument();
    expect(screen.getByText("고객 생성")).toBeVisible();
  });
});
