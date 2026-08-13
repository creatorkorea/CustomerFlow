import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireUser: vi.fn()
}));

vi.mock("@/server/customers/service", () => ({
  deleteCustomer: vi.fn(),
  getCustomer: vi.fn(),
  updateCustomer: vi.fn()
}));

import {
  DELETE,
  GET,
  PUT
} from "@/app/api/customers/[id]/route";
import { requireUser } from "@/server/auth/session";
import {
  deleteCustomer,
  getCustomer,
  updateCustomer
} from "@/server/customers/service";

const owner = {
  id: "3",
  email: "owner@example.com",
  name: "Owner",
  role: "owner",
  organizationId: "7"
};

describe("/api/customers/[id]", () => {
  it("gets a customer by id within the session organization", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(owner);
    vi.mocked(getCustomer).mockResolvedValueOnce({
      id: "31",
      organizationId: "7",
      name: "김철수",
      phone: null,
      email: null,
      address: null,
      status: "new",
      memo: null,
      lastContactedAt: null,
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T00:00:00.000Z",
      tags: []
    });

    const response = await GET(new Request("http://localhost/api/customers/31"), {
      params: Promise.resolve({ id: "31" })
    });

    expect(response.status).toBe(200);
    expect(getCustomer).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 31n,
        organizationId: 7n
      })
    );
  });

  it("updates a customer using only the session organization", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(owner);
    vi.mocked(updateCustomer).mockResolvedValueOnce({
      id: "31",
      organizationId: "7",
      name: "수정 고객",
      phone: null,
      email: null,
      address: null,
      status: "reserved",
      memo: null,
      lastContactedAt: null,
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T00:00:00.000Z",
      tags: []
    });

    const response = await PUT(
      new Request("http://localhost/api/customers/31", {
        method: "PUT",
        body: JSON.stringify({
          name: "수정 고객",
          status: "reserved",
          organizationId: "999"
        })
      }),
      {
        params: Promise.resolve({ id: "31" })
      }
    );

    expect(response.status).toBe(200);
    expect(updateCustomer).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 31n,
        organizationId: 7n,
        userId: 3n,
        input: {
          name: "수정 고객",
          status: "reserved",
          tagIds: []
        }
      })
    );
  });

  it("soft deletes a customer using only the session organization", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce(owner);
    vi.mocked(deleteCustomer).mockResolvedValueOnce(undefined);

    const response = await DELETE(
      new Request("http://localhost/api/customers/31", {
        method: "DELETE"
      }),
      {
        params: Promise.resolve({ id: "31" })
      }
    );

    expect(response.status).toBe(200);
    expect(deleteCustomer).toHaveBeenCalledWith({
      customerId: 31n,
      organizationId: 7n,
      userId: 3n
    });
  });
});
