import * as z from "zod"

// Show info schemas

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

// Show search result schema

export const showSearchResultSchema = z.object({
  tvmaze_id: z.number(),
  name: z.string(),
  genres: z.nullish(z.array(z.string())),
  start_year: z.nullish(z.number()),
  end_year: z.nullish(z.number()),
  network: z.nullish(z.string()),
  network_country: z.nullish(z.string()),
  streaming_service: z.nullish(z.string()),
  streaming_service_country: z.nullish(z.string()),
  summary_html: z.nullish(z.string()),
  image_sm_url: z.nullish(z.url()),
})
export type ShowSearchResult = z.infer<typeof showSearchResultSchema>

export const showSearchResultsSchema = z.object({
  results: z.array(showSearchResultSchema),
})
export type ShowSearchResults = z.infer<typeof showSearchResultsSchema>
