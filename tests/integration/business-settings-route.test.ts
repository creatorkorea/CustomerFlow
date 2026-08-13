import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireUser: vi.fn()
}));

vi.mock("@/server/settings/business-service", () => ({
  assertCanManageBusinessSettings: vi.fn(),
  getBusinessSettings: vi.fn(),
  updateBusinessSettings: vi.fn()
}));

import { GET, PUT } from "@/app/api/settings/business/route";
import { requireUser } from "@/server/auth/session";
import {
  assertCanManageBusinessSettings,
  getBusinessSettings,
  updateBusinessSettings
} from "@/server/settings/business-service";

const owner = {
  id: "3",
  email: "owner@example.com",
  name: "Owner",
  role: "owner",
  organizationId: "7"
};

describe("/api/settings/business", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets business settings from the session organization", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(owner);
    vi.mocked(getBusinessSettings).mockResolvedValueOnce({
      id: "7",
      name: "CustomerFlow Demo",
      businessNumber: "000-00-00000",
      phone: null,
      email: null,
      timezone: "Asia/Seoul",
      plan: "free",
      status: "active",
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T00:00:00.000Z"
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(getBusinessSettings).toHaveBeenCalledWith({
      organizationId: 7n
    });
  });

  it("updates business settings using only the session organization", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(owner);
    vi.mocked(updateBusinessSettings).mockResolvedValueOnce({
      id: "7",
      name: "새 상호",
      businessNumber: null,
      phone: "02-5555-0000",
      email: "team@example.com",
      timezone: "Asia/Seoul",
      plan: "free",
      status: "active",
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T01:00:00.000Z"
    });

    const response = await PUT(
      new Request("http://localhost/api/settings/business", {
        method: "PUT",
        body: JSON.stringify({
          name: "새 상호",
          businessNumber: "",
          phone: "02-5555-0000",
          email: "team@example.com",
          timezone: "Asia/Seoul",
          organizationId: "999"
        })
      })
    );

    expect(response.status).toBe(200);
    expect(assertCanManageBusinessSettings).toHaveBeenCalledWith("owner");
    expect(updateBusinessSettings).toHaveBeenCalledWith({
      organizationId: 7n,
      userId: 3n,
      input: {
        name: "새 상호",
        businessNumber: null,
        phone: "02-5555-0000",
        email: "team@example.com",
        timezone: "Asia/Seoul"
      }
    });
  });

  it("rejects invalid business settings payloads before updating", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(owner);

    const response = await PUT(
      new Request("http://localhost/api/settings/business", {
        method: "PUT",
        body: JSON.stringify({
          name: "",
          email: "not-an-email",
          timezone: ""
        })
      })
    );

    expect(response.status).toBe(400);
    expect(updateBusinessSettings).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR"
      }
    });
  });
});
