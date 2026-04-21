export function generateSKU(
  productName: string,
  variantName: string,
  count: number
): string {
  const cleanProductName = (productName || "UNKNW")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 5)

  const cleanVariantName = variantName
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 5)

  const sequence = String(count + 1).padStart(3, "0")

  return `${cleanProductName}-${cleanVariantName}-${sequence}`
}
