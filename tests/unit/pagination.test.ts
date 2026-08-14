import { describe, expect, it } from "vitest";

import { buildPageHref, getPageSummary } from "@/lib/pagination";

describe("pagination helpers", () => {
  it("builds page links while preserving non-empty filters", () => {
    const href = buildPageHref("/customers", {
      params: {
        search: "김",
        status: "consulting",
        tagId: "",
        page: "1"
      },
      page: 2
    });

    expect(href).toBe("/customers?search=%EA%B9%80&status=consulting&page=2");
  });

  it("omits the page parameter for the first page", () => {
    const href = buildPageHref("/reservations", {
      params: {
        customerId: "21",
        status: "scheduled",
        page: "3"
      },
      page: 1
    });

    expect(href).toBe("/reservations?customerId=21&status=scheduled");
  });

  it("summarizes the visible result range", () => {
    expect(getPageSummary({ page: 2, pageSize: 20, total: 45 })).toEqual({
      from: 21,
      to: 40,
      totalPages: 3
    });
    expect(getPageSummary({ page: 1, pageSize: 20, total: 0 })).toEqual({
      from: 0,
      to: 0,
      totalPages: 1
    });
  });
});
