import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    customer: {
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn()
    },
    tag: {
      count: vi.fn()
    },
    activityLog: {
      create: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

import { prisma } from "@/lib/db";
import {
  deleteCustomer,
  updateCustomer,
  createCustomer,
  listCustomers
} from "@/server/customers/service";

describe("customer service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only non-deleted customers for the current organization", async () => {
    vi.mocked(prisma.customer.count).mockResolvedValueOnce(1);
    vi.mocked(prisma.customer.findMany).mockResolvedValueOnce([
      {
        id: 11n,
        organizationId: 7n,
        name: "김철수",
        phone: "010-1111-1111",
        email: null,
        address: null,
        status: "new",
        memo: null,
        lastContactedAt: null,
        createdAt: new Date("2026-08-13T00:00:00.000Z"),
        updatedAt: new Date("2026-08-13T00:00:00.000Z"),
        tags: []
      }
    ] as never);

    const result = await listCustomers({
      organizationId: 7n,
      search: "김철수"
    });

    expect(prisma.customer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: 7n,
          deletedAt: null,
          OR: [
            { name: { contains: "김철수", mode: "insensitive" } },
            { phone: { contains: "김철수" } },
            { email: { contains: "김철수", mode: "insensitive" } }
          ]
        })
      })
    );
    expect(result).toMatchObject({
      total: 1,
      customers: [
        {
          id: "11",
          name: "김철수",
          status: "new"
        }
      ]
    });
  });

  it("creates customers in the current organization and records activity", async () => {
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
      callback({
        customer: {
          create: vi.fn().mockResolvedValueOnce({
            id: 21n,
            organizationId: 7n,
            name: "이영희",
            phone: "010-2222-2222",
            email: "customer@example.com",
            address: "서울시",
            status: "consulting",
            memo: "신규 문의",
            lastContactedAt: null,
            createdAt: new Date("2026-08-13T00:00:00.000Z"),
            updatedAt: new Date("2026-08-13T00:00:00.000Z")
          })
        },
        activityLog: {
          create: vi.fn()
        }
      } as never)
    );

    const result = await createCustomer({
      organizationId: 7n,
      userId: 3n,
      input: {
        name: "이영희",
        phone: "010-2222-2222",
        email: "customer@example.com",
        address: "서울시",
        status: "consulting",
        memo: "신규 문의"
      }
    });

    expect(result).toMatchObject({
      id: "21",
      organizationId: "7",
      name: "이영희",
      status: "consulting"
    });
  });

  it("updates only customers that belong to the current organization", async () => {
    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce({
      id: 31n
    } as never);
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
      callback({
        customer: {
          update: vi.fn().mockResolvedValueOnce({
            id: 31n,
            organizationId: 7n,
            name: "수정 고객",
            phone: "010-3333-3333",
            email: null,
            address: null,
            status: "reserved",
            memo: null,
            lastContactedAt: null,
            createdAt: new Date("2026-08-13T00:00:00.000Z"),
            updatedAt: new Date("2026-08-13T00:00:00.000Z")
          })
        },
        activityLog: {
          create: vi.fn()
        }
      } as never)
    );

    const result = await updateCustomer({
      customerId: 31n,
      organizationId: 7n,
      userId: 3n,
      input: {
        name: "수정 고객",
        phone: "010-3333-3333",
        status: "reserved"
      }
    });

    expect(prisma.customer.findFirst).toHaveBeenCalledWith({
      where: {
        id: 31n,
        organizationId: 7n,
        deletedAt: null
      },
      select: {
        id: true
      }
    });
    expect(result).toMatchObject({
      id: "31",
      name: "수정 고객",
      status: "reserved"
    });
  });

  it("soft deletes only customers that belong to the current organization", async () => {
    vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce({
      id: 41n
    } as never);
    vi.mocked(prisma.$transaction).mockImplementationOnce(async (callback) =>
      callback({
        customer: {
          update: vi.fn()
        },
        activityLog: {
          create: vi.fn()
        }
      } as never)
    );

    await deleteCustomer({
      customerId: 41n,
      organizationId: 7n,
      userId: 3n
    });

    expect(prisma.customer.findFirst).toHaveBeenCalledWith({
      where: {
        id: 41n,
        organizationId: 7n,
        deletedAt: null
      },
      select: {
        id: true
      }
    });
  });
});
