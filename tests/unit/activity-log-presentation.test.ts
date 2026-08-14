import { describe, expect, it } from "vitest";

import {
  formatActivityAction,
  formatActivityEntity,
  getActivityHref
} from "@/server/activity-log/presentation";

describe("activity log presentation", () => {
  it("formats known action and entity labels in Korean", () => {
    expect(formatActivityAction("CUSTOMER_CREATED")).toBe("고객 등록");
    expect(formatActivityAction("FOLLOW_UP_STATUS_UPDATED")).toBe(
      "후속관리 상태 변경"
    );
    expect(formatActivityEntity("RESERVATION")).toBe("예약");
  });

  it("keeps unknown labels visible for diagnostics", () => {
    expect(formatActivityAction("UNKNOWN_ACTION")).toBe("UNKNOWN_ACTION");
    expect(formatActivityEntity("UNKNOWN_ENTITY")).toBe("UNKNOWN_ENTITY");
  });

  it("builds tenant-safe internal links from activity metadata", () => {
    expect(
      getActivityHref({
        entityType: "CUSTOMER",
        entityId: 21n
      })
    ).toBe("/customers/21");
    expect(
      getActivityHref({
        entityType: "RESERVATION",
        entityId: 71n,
        metadata: {
          customerId: "21"
        }
      })
    ).toBe("/reservations?customerId=21");
    expect(
      getActivityHref({
        entityType: "ORGANIZATION",
        entityId: 1n
      })
    ).toBe("/settings/business");
  });
});
