const RENTAL_TYPES = new Set(["For Rent", "Renting"]);

export function formatPrice(price: number, type?: string | null): string {
  const n = price.toLocaleString("en-KE");
  return RENTAL_TYPES.has(type ?? "") ? `KES ${n} / month` : `KES ${n}`;
}
