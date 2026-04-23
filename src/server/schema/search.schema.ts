import z from "zod"

export const searchSchema = z.object({
  q: z.string().min(1, "Search query is required").optional(),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().default(20).optional(),
})

export type SearchSchema = z.infer<typeof searchSchema>
