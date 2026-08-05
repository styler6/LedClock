export interface PricedLineItem {
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface LineItemTotals {
  lineTotal: number;
}

export interface DocumentTotals {
  subtotal: number;
  taxTotal: number;
  total: number;
  taxBreakdown: { taxRate: number; taxableAmount: number; taxAmount: number }[];
}

/** Rounds to 2 decimal places using "round half away from zero", matching typical invoicing conventions. */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateLineTotal(item: PricedLineItem): number {
  return roundCurrency(item.quantity * item.unitPrice);
}

/**
 * Aggregates line items into subtotal/tax/total, grouping tax by rate since
 * German invoices commonly mix 19% and 7% MwSt on the same document.
 */
export function calculateDocumentTotals(items: PricedLineItem[]): DocumentTotals {
  const byRate = new Map<number, number>();

  for (const item of items) {
    const lineTotal = calculateLineTotal(item);
    byRate.set(item.taxRate, (byRate.get(item.taxRate) ?? 0) + lineTotal);
  }

  const taxBreakdown = Array.from(byRate.entries()).map(([taxRate, taxableAmount]) => ({
    taxRate,
    taxableAmount: roundCurrency(taxableAmount),
    taxAmount: roundCurrency(taxableAmount * (taxRate / 100)),
  }));

  const subtotal = roundCurrency(taxBreakdown.reduce((sum, t) => sum + t.taxableAmount, 0));
  const taxTotal = roundCurrency(taxBreakdown.reduce((sum, t) => sum + t.taxAmount, 0));

  return {
    subtotal,
    taxTotal,
    total: roundCurrency(subtotal + taxTotal),
    taxBreakdown,
  };
}
