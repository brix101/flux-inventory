export function generateSKU(productId: string, variantId: string): string {
  const year = new Date().getFullYear().toString().slice(-2);

  const productSlice = productId.replace(/-/g, "").slice(0, 6).toUpperCase();

  const variantSlice = variantId.replace(/-/g, "").slice(0, 6).toUpperCase();

  // Format: 26550E84-A9F2B1
  return `${year}${productSlice}-${variantSlice}`;
}
