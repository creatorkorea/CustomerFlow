import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireOrganizationId: vi.fn(),
  requireUser: vi.fn()
}));

vi.mock("@/server/follow-ups/service", () => ({
  createFollowUp: vi.fn(),
  listFollowUps: vi.fn()
}));

import { GET, POST } from "@/app/api/follow-ups/route";
import { requireOrganizationId, requireUser } from "@/server/auth/session";
import {
  createFollowUp,
  listFollowUps
} from "@/server/follow-ups/service";

describe("/api/follow-ups", () => {
  it("uses the session organization when listing follow-ups", async () => {
    vi.mocked(requireOrganizationId).mockResolvedValueOnce(7n);
    vi.mocked(listFollowUps).mockResolvedValueOnce({
      followUps: [],
      total: 0,
      page: 1,
      pageSize: 20
    });

    const response = await GET(
      new Request("http://localhost/api/follow-ups?customerId=21")
    );

    expect(response.status).toBe(200);
    expect(listFollowUps).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 7n,
        customerId: "21"
      })
    );
  });

  it("rejects invalid follow-up creation payloads before creating records", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce({
      id: "3",
      email: "owner@example.com",
      name: "Owner",
      role: "owner",
      organizationId: "7"
    });

    const response = await POST(
      new Request("http://localhost/api/follow-ups", {
        method: "POST",
        body: JSON.stringify({
          customerId: "21",
          title: "",
          dueAt: "2026-08-15T10:00:00+09:00"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(createFollowUp).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR"
      }
    });
  });
});
