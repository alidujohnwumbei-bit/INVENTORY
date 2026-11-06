/**
 * Format currency in Ghana Cedis (GHS / GH₵)
 */
export function formatGHS(amount: number, showSymbol = true): string {
  const safeAmount = isNaN(amount) || !isFinite(amount) ? 0 : amount;
  const formatted = safeAmount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `GHS ${formatted}` : formatted;
}

/**
 * Format integer or decimal numbers
 */
export function formatQuantity(qty: number): string {
  const safeQty = isNaN(qty) || !isFinite(qty) ? 0 : qty;
  return safeQty.toLocaleString('en-GH', {
    maximumFractionDigits: 2,
  });
}

/**
 * Parse input string to float cleanly, treating invalid as 0
 */
export function sanitizeNumberInput(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  // Replace anything except digits, decimal point, minus
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
