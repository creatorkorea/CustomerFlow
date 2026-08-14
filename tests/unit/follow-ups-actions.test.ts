import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("@/server/auth/session", () => ({
  requireUser: vi.fn()
}));

vi.mock("@/server/follow-ups/service", () => ({
  updateFollowUp: vi.fn()
}));

import { revalidatePath } from "next/cache";

import { requireUser } from "@/server/auth/session";
import { updateFollowUpAction } from "@/server/follow-ups/actions";
import { updateFollowUp } from "@/server/follow-ups/service";

const sessionUser = {
  id: "3",
  email: "owner@example.com",
  name: "Owner",
  role: "owner",
  organizationId: "7"
};

describe("follow-up actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a follow-up from the session tenant and refreshes related pages", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(sessionUser);
    vi.mocked(updateFollowUp).mockResolvedValueOnce({
      id: "101",
      organizationId: "7",
      customerId: "21",
      customerName: "김철수",
      customerPhone: "010-1111-1111",
      consultationId: null,
      consultationContent: null,
      userId: "3",
      userName: "Owner",
      title: "방문 후 만족도 확인",
      memo: null,
      dueAt: "2026-08-16T01:00:00.000Z",
      status: "completed",
      completedAt: "2026-08-13T01:00:00.000Z",
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T01:00:00.000Z"
    });

    const formData = new FormData();
    formData.set("followUpId", "101");
    formData.set("title", "방문 후 만족도 확인");
    formData.set("memo", "");
    formData.set("dueAt", "2026-08-16T10:00");
    formData.set("status", "completed");

    await updateFollowUpAction(formData);

    expect(updateFollowUp).toHaveBeenCalledWith({
      followUpId: 101n,
      organizationId: 7n,
      userId: 3n,
      input: {
        title: "방문 후 만족도 확인",
        memo: undefined,
        dueAt: "2026-08-16T10:00:00+09:00",
        status: "completed"
      }
    });
    expect(revalidatePath).toHaveBeenCalledWith("/follow-ups");
    expect(revalidatePath).toHaveBeenCalledWith("/follow-ups/101");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("does not update when the form payload is invalid", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(sessionUser);
    const formData = new FormData();
    formData.set("followUpId", "101");
    formData.set("title", "");
    formData.set("dueAt", "not-a-date");
    formData.set("status", "pending");

    await updateFollowUpAction(formData);

    expect(updateFollowUp).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
