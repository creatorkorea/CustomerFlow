import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireOrganizationId: vi.fn(),
  requireUser: vi.fn()
}));

vi.mock("@/server/consultations/service", () => ({
  createConsultation: vi.fn(),
  listConsultations: vi.fn()
}));

import { GET, POST } from "@/app/api/consultations/route";
import { requireOrganizationId, requireUser } from "@/server/auth/session";
import {
  createConsultation,
  listConsultations
} from "@/server/consultations/service";

describe("/api/consultations", () => {
  it("uses the session organization when listing consultations", async () => {
    vi.mocked(requireOrganizationId).mockResolvedValueOnce(7n);
    vi.mocked(listConsultations).mockResolvedValueOnce({
      consultations: [],
      total: 0,
      page: 1,
      pageSize: 20
    });

    const response = await GET(
      new Request("http://localhost/api/consultations?customerId=21")
    );

    expect(response.status).toBe(200);
    expect(listConsultations).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 7n,
        customerId: "21"
      })
    );
  });

  it("rejects invalid consultation creation payloads before creating records", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce({
      id: "3",
      email: "owner@example.com",
      name: "Owner",
      role: "owner",
      organizationId: "7"
    });

    const response = await POST(
      new Request("http://localhost/api/consultations", {
        method: "POST",
        body: JSON.stringify({
          customerId: "21",
          content: ""
        })
      })
    );

    expect(response.status).toBe(400);
    expect(createConsultation).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR"
      }
    });
  });
});
