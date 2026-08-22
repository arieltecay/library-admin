export function unitGrossProfit(price: number, cost: number): number {
  return price - cost;
}

export function unitMarginPercent(price: number, cost: number): number | null {
  if (price <= 0) return null;
  return (unitGrossProfit(price, cost) / price) * 100;
}

export function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${value.toFixed(1)}%`;
}