import { describe, it, expect } from "vitest";
import { calculateOptimalPricing } from "@/lib/pricing";
import type { PricePack } from "@/lib/pricing";

// Pack fixtures — quantity matches the type default so getPackQuantity is deterministic
const single: PricePack = { id: "s", name: "Single", type: "SINGLE", price: 5, quantity: 1 };
const pack5: PricePack = { id: "p5", name: "Pack 5", type: "PACK_5", price: 20, quantity: 5 };
const pack10: PricePack = { id: "p10", name: "Pack 10", type: "PACK_10", price: 35, quantity: 10 };
const allInclusive: PricePack = {
  id: "ai",
  name: "All Inclusive",
  type: "ALL_INCLUSIVE",
  price: 30,
  quantity: null,
};

describe("calculateOptimalPricing", () => {
  it("returns zero result for 0 photos", () => {
    expect(calculateOptimalPricing(0, [single])).toEqual({
      packs: [],
      totalPrice: 0,
      savings: 0,
      unitPriceEquiv: 0,
    });
  });

  it("returns zero result for empty pack list", () => {
    expect(calculateOptimalPricing(5, [])).toEqual({
      packs: [],
      totalPrice: 0,
      savings: 0,
      unitPriceEquiv: 0,
    });
  });

  it("prices singles when only singles exist (3 photos)", () => {
    const result = calculateOptimalPricing(3, [single]);
    expect(result.totalPrice).toBe(15);
    // savings = 0 because single is the reference price
    expect(result.savings).toBe(0);
  });

  it("prefers the cheaper-per-photo pack over singles", () => {
    // pack5 at €20 is €4/photo; singles would be 5×€5=€25
    const result = calculateOptimalPricing(5, [single, pack5]);
    expect(result.totalPrice).toBe(20);
    expect(result.savings).toBe(5); // 25 - 20
  });

  it("greedy: uses pack10 + single for 11 photos", () => {
    // pack10 = €35 for 10, single = €5 for 1 → total €40
    // vs 11 singles = €55 → pack10+single wins
    const result = calculateOptimalPricing(11, [single, pack10]);
    expect(result.totalPrice).toBe(40);
  });

  it("ALL_INCLUSIVE chosen when cheaper than singles", () => {
    // allInclusive = €30 for all, 10 singles = €50 → allInclusive wins
    const result = calculateOptimalPricing(10, [single, allInclusive]);
    expect(result.totalPrice).toBe(30);
    // savings relative to singles
    expect(result.savings).toBe(20); // 50 - 30
  });

  it("ALL_INCLUSIVE NOT chosen when singles are cheaper", () => {
    // 2 photos × €5 single = €10, allInclusive = €30 → singles win
    const result = calculateOptimalPricing(2, [single, allInclusive]);
    expect(result.totalPrice).toBe(10);
  });

  it("unitPriceEquiv is positive when a pack is selected", () => {
    const result = calculateOptimalPricing(5, [single, pack5]);
    expect(result.unitPriceEquiv).toBeGreaterThan(0);
  });
});
