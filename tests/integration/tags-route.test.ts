import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireOrganizationId: vi.fn(),
  requireUser: vi.fn()
}));

vi.mock("@/server/tags/service", () => ({
  createTag: vi.fn(),
  listTags: vi.fn()
}));

import { GET, POST } from "@/app/api/tags/route";
import { requireOrganizationId, requireUser } from "@/server/auth/session";
import { createTag, listTags } from "@/server/tags/service";

describe("/api/tags", () => {
  it("uses the session organization when listing tags", async () => {
    vi.mocked(requireOrganizationId).mockResolvedValueOnce(7n);
    vi.mocked(listTags).mockResolvedValueOnce({
      tags: [],
      total: 0,
      page: 1,
      pageSize: 50
    });

    const response = await GET(new Request("http://localhost/api/tags"));

    expect(response.status).toBe(200);
    expect(listTags).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 7n
      })
    );
  });

  it("rejects invalid tag creation payloads before creating records", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce({
      id: "3",
      email: "owner@example.com",
      name: "Owner",
      role: "owner",
      organizationId: "7"
    });

    const response = await POST(
      new Request("http://localhost/api/tags", {
        method: "POST",
        body: JSON.stringify({
          name: "",
          color: "red"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(createTag).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR"
      }
    });
  });
});
