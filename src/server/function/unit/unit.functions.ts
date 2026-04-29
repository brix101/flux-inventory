import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

export const unitOptions = [
  { id: "pcs", name: "Pieces (pcs)" },
  { id: "kg", name: "Kilograms (kg)" },
  { id: "g", name: "Grams (g)" },
  { id: "m", name: "Meters (m)" },
  { id: "cm", name: "Centimeters (cm)" },
  { id: "L", name: "Liters (L)" },
  { id: "ml", name: "Milliliters (ml)" },
  { id: "box", name: "Box" },
  { id: "pack", name: "Pack" },
] as const

export type UnitOption = (typeof unitOptions)[number]

export const getUnitsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return unitOptions
  }
)

export const unitsQueryOptions = queryOptions({
  queryKey: ["units"],
  queryFn: () => getUnitsFn({ data: undefined }),
})
