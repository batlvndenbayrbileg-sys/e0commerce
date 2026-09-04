import { segmentOf, SEGMENT_LABEL, VIP_LTV, NEW_DAYS, INACTIVE_DAYS } from "../crm";

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 0, 1); // fixed "now" for deterministic tests
const daysAgo = (n: number) => new Date(NOW - n * DAY).toISOString();

describe("crm.segmentOf", () => {
  it("VIP wins when lifetime value reaches the threshold, regardless of recency", () => {
    const agg = { ltv: VIP_LTV, orders: 3, lastOrder: NOW - 200 * DAY };
    expect(segmentOf(agg, daysAgo(400), NOW)).toBe("vip");
  });

  it("new: account younger than NEW_DAYS (and not VIP)", () => {
    const agg = { ltv: 1000, orders: 1, lastOrder: NOW };
    expect(segmentOf(agg, daysAgo(NEW_DAYS - 1), NOW)).toBe("new");
  });

  it("none: registered long ago with no orders", () => {
    expect(segmentOf(undefined, daysAgo(NEW_DAYS + 10), NOW)).toBe("none");
    expect(segmentOf({ ltv: 0, orders: 0, lastOrder: null }, daysAgo(200), NOW)).toBe("none");
  });

  it("inactive: has ordered, but last order older than INACTIVE_DAYS", () => {
    const agg = { ltv: 1000, orders: 2, lastOrder: NOW - (INACTIVE_DAYS + 5) * DAY };
    expect(segmentOf(agg, daysAgo(300), NOW)).toBe("inactive");
  });

  it("active: ordered within the inactive window", () => {
    const agg = { ltv: 1000, orders: 2, lastOrder: NOW - (INACTIVE_DAYS - 5) * DAY };
    expect(segmentOf(agg, daysAgo(300), NOW)).toBe("active");
  });

  it("priority: VIP over new over inactive over active", () => {
    // VIP threshold beats the new-account rule.
    expect(segmentOf({ ltv: VIP_LTV, orders: 1, lastOrder: NOW }, daysAgo(1), NOW)).toBe("vip");
  });

  it("every segment has a Mongolian label", () => {
    (["vip", "new", "active", "inactive", "none"] as const).forEach((s) => {
      expect(typeof SEGMENT_LABEL[s]).toBe("string");
      expect(SEGMENT_LABEL[s].length).toBeGreaterThan(0);
    });
  });
});
