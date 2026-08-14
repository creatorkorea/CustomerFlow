import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/actions", () => ({
  logoutAction: vi.fn()
}));

import { AppHeader } from "@/components/layout/app-header";

describe("AppHeader", () => {
  it("submits the global customer search as a GET request to the customer list", () => {
    const { container } = render(
      <AppHeader unreadNotificationCount={3} userName="홍길동" />
    );

    const searchInput = screen.getByRole("searchbox", {
      name: "고객 또는 전화번호 검색"
    });
    const searchForm = container.querySelector('form[action="/customers"]');

    expect(searchInput).toHaveAttribute("name", "search");
    expect(searchForm).toHaveAttribute("method", "get");
    expect(searchForm).toContainElement(searchInput);
  });
});
