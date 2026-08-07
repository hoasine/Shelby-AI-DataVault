/** Datasets at or below this price (octas) skip on-chain purchase_dataset (Shelbynet simulate timeout). */
export const FREE_PRICE_MAX_OCTAS = 10_000; // 0.0001 APT

export function isFreePrice(priceOctas: number): boolean {
  return priceOctas <= FREE_PRICE_MAX_OCTAS;
}

export function formatAptPrice(priceOctas: number): string {
  if (isFreePrice(priceOctas)) return "Free";
  const apt = priceOctas / 1e8;
  return apt < 0.01 ? apt.toFixed(4) : apt.toFixed(2);
}
