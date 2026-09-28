import { describe, expect, it } from "vitest";
import { addBusinessDays, computeDueAt, describeDue } from "@/lib/orders";

describe("due dates", () => {
  it("skips weekends", () => {
    const fri = new Date("2026-10-02T12:00:00Z");
    expect(addBusinessDays(fri, 1).toISOString()).toBe("2026-10-05T12:00:00.000Z");
    expect(addBusinessDays(fri, 5).toISOString()).toBe("2026-10-09T12:00:00.000Z");
  });
  it("rush is 48 hours", () => {
    const now = new Date("2026-10-02T12:00:00Z");
    expect(computeDueAt("wedding", true, now).toISOString()).toBe("2026-10-04T12:00:00.000Z");
  });
  it("describes overdue", () => {
    const now = new Date("2026-10-02T12:00:00Z");
    expect(describeDue(new Date("2026-10-01T10:00:00Z"), now)).toEqual({ label: "1d 2h overdue", overdue: true });
    expect(describeDue(new Date("2026-10-02T15:30:00Z"), now).label).toBe("3h 30m left");
  });
});
