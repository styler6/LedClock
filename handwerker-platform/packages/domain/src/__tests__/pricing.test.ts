import { describe, expect, it } from "vitest";
import { calculateDocumentTotals, calculateLineTotal, roundCurrency } from "../pricing";

describe("roundCurrency", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundCurrency(10.005)).toBe(10.01);
    expect(roundCurrency(10.004)).toBe(10);
  });
});

describe("calculateLineTotal", () => {
  it("multiplies quantity by unit price", () => {
    expect(calculateLineTotal({ quantity: 3, unitPrice: 19.99, taxRate: 19 })).toBe(59.97);
  });
});

describe("calculateDocumentTotals", () => {
  it("sums a single tax rate", () => {
    const totals = calculateDocumentTotals([
      { quantity: 2, unitPrice: 100, taxRate: 19 },
      { quantity: 1, unitPrice: 50, taxRate: 19 },
    ]);
    expect(totals.subtotal).toBe(250);
    expect(totals.taxTotal).toBe(47.5);
    expect(totals.total).toBe(297.5);
    expect(totals.taxBreakdown).toEqual([{ taxRate: 19, taxableAmount: 250, taxAmount: 47.5 }]);
  });

  it("groups mixed German VAT rates (19% and 7%) separately", () => {
    const totals = calculateDocumentTotals([
      { quantity: 1, unitPrice: 100, taxRate: 19 },
      { quantity: 1, unitPrice: 100, taxRate: 7 },
    ]);
    expect(totals.subtotal).toBe(200);
    expect(totals.taxTotal).toBe(26);
    expect(totals.total).toBe(226);
    expect(totals.taxBreakdown).toHaveLength(2);
  });
});
