import { describe, expect, it } from "vitest";
import { formatUSD, priceOrder, revisionsAllowed } from "@/lib/pricing";

describe("priceOrder", () => {
  it("prices a base service", () => {
    expect(priceOrder("wedding", []).totalCents).toBe(19900);
  });
  it("adds rush as 50% of base", () => {
    expect(priceOrder("eulogy", ["rush"]).totalCents).toBe(24900 + 12450);
  });
  it("adds fixed add-ons and ignores duplicates", () => {
    const { totalCents, lines } = priceOrder("other", ["coaching", "extra_revision", "coaching"]);
    expect(totalCents).toBe(14900 + 7500 + 4900);
    expect(lines).toHaveLength(3);
  });
  it("counts revision rounds", () => {
    expect(revisionsAllowed([])).toBe(1);
    expect(revisionsAllowed(["extra_revision"])).toBe(2);
  });
  it("formats currency", () => {
    expect(formatUSD(19900)).toBe("$199");
    expect(formatUSD(37350)).toBe("$373.50");
  });
});
