import * as z from "zod"

export const episodeSchema = z.object({
  type: z.literal(["episode", "special"]),
  watched: z.boolean(),
})
export type Episode = z.infer<typeof episodeSchema>

export const showSchema = z.object({
  id: z.uuid(),
  tvmaze_id: z.number(),
  title: z.string(),
  source: z.string(),
  duration: z.number(),
  image_sm_url: z.optional(z.url()),
  image_lg_url: z.optional(z.url()),
  imdb_id: z.optional(z.string()),
  thetvdb_id: z.optional(z.number()),
  seasons: z.array(z.array(episodeSchema)),
})
export type Show = z.infer<typeof showSchema>

export const showListSchema = z.array(showSchema)
export type ShowList = z.infer<typeof showListSchema>
