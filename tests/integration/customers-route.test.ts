import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireOrganizationId: vi.fn(),
  requireUser: vi.fn()
}));

vi.mock("@/server/customers/service", () => ({
  createCustomer: vi.fn(),
  listCustomers: vi.fn()
}));

import { GET, POST } from "@/app/api/customers/route";
import { requireOrganizationId, requireUser } from "@/server/auth/session";
import { createCustomer, listCustomers } from "@/server/customers/service";

describe("/api/customers", () => {
  it("uses the session organization when listing customers", async () => {
    vi.mocked(requireOrganizationId).mockResolvedValueOnce(7n);
    vi.mocked(listCustomers).mockResolvedValueOnce({
      customers: [],
      total: 0,
      page: 1,
      pageSize: 20
    });

    const response = await GET(
      new Request("http://localhost/api/customers?search=%EA%B9%80&tagId=101")
    );

    expect(response.status).toBe(200);
    expect(listCustomers).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 7n,
        search: "김",
        tagId: "101"
      })
    );
  });

  it("rejects invalid customer creation payloads before creating records", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce({
      id: "3",
      email: "owner@example.com",
      name: "Owner",
      role: "owner",
      organizationId: "7"
    });

    const response = await POST(
      new Request("http://localhost/api/customers", {
        method: "POST",
        body: JSON.stringify({
          name: "",
          email: "not-an-email"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(createCustomer).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR"
      }
    });
  });
});
