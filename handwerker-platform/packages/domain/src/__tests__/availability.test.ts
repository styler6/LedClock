import { describe, expect, it } from "vitest";
import { isEquipmentAvailable, rangesOverlap } from "../availability";

describe("rangesOverlap", () => {
  it("detects overlapping ranges", () => {
    expect(
      rangesOverlap({ startAt: "2026-01-01T00:00:00Z", endAt: "2026-01-05T00:00:00Z" }, { startAt: "2026-01-03T00:00:00Z", endAt: "2026-01-06T00:00:00Z" }),
    ).toBe(true);
  });

  it("does not flag adjacent, non-overlapping ranges", () => {
    expect(
      rangesOverlap({ startAt: "2026-01-01T00:00:00Z", endAt: "2026-01-05T00:00:00Z" }, { startAt: "2026-01-05T00:00:00Z", endAt: "2026-01-10T00:00:00Z" }),
    ).toBe(false);
  });
});

describe("isEquipmentAvailable", () => {
  const candidate = { startAt: "2026-02-01T00:00:00Z", endAt: "2026-02-05T00:00:00Z" };

  it("is available when there are no bookings", () => {
    expect(isEquipmentAvailable(candidate, [])).toBe(true);
  });

  it("is unavailable when an active booking overlaps", () => {
    const bookings = [{ startAt: "2026-02-03T00:00:00Z", endAt: "2026-02-06T00:00:00Z", status: "reserved" }];
    expect(isEquipmentAvailable(candidate, bookings)).toBe(false);
  });

  it("ignores cancelled/returned bookings when checking overlap", () => {
    const bookings = [{ startAt: "2026-02-03T00:00:00Z", endAt: "2026-02-06T00:00:00Z", status: "cancelled" }];
    expect(isEquipmentAvailable(candidate, bookings)).toBe(true);
  });
});
