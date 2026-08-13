import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireUser: vi.fn()
}));

vi.mock("@/server/follow-ups/service", () => ({
  updateFollowUpStatus: vi.fn()
}));

import { PATCH } from "@/app/api/follow-ups/[id]/route";
import { requireUser } from "@/server/auth/session";
import { updateFollowUpStatus } from "@/server/follow-ups/service";

const owner = {
  id: "3",
  email: "owner@example.com",
  name: "Owner",
  role: "owner",
  organizationId: "7"
};

describe("/api/follow-ups/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates status using only the session organization", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(owner);
    vi.mocked(updateFollowUpStatus).mockResolvedValueOnce({
      id: "101",
      organizationId: "7",
      customerId: "21",
      customerName: "김철수",
      customerPhone: null,
      consultationId: null,
      consultationContent: null,
      userId: "3",
      userName: "Owner",
      title: "예약 전 확인 연락",
      memo: null,
      dueAt: "2026-08-15T01:00:00.000Z",
      status: "completed",
      completedAt: "2026-08-13T01:00:00.000Z",
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T01:00:00.000Z"
    });

    const response = await PATCH(
      new Request("http://localhost/api/follow-ups/101", {
        method: "PATCH",
        body: JSON.stringify({
          status: "completed",
          organizationId: "999"
        })
      }),
      {
        params: Promise.resolve({ id: "101" })
      }
    );

    expect(response.status).toBe(200);
    expect(updateFollowUpStatus).toHaveBeenCalledWith({
      followUpId: 101n,
      organizationId: 7n,
      userId: 3n,
      input: {
        status: "completed"
      }
    });
  });

  it("rejects invalid status payloads before updating", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(owner);

    const response = await PATCH(
      new Request("http://localhost/api/follow-ups/101", {
        method: "PATCH",
        body: JSON.stringify({
          status: "done"
        })
      }),
      {
        params: Promise.resolve({ id: "101" })
      }
    );

    expect(response.status).toBe(400);
    expect(updateFollowUpStatus).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR"
      }
    });
  });
});
