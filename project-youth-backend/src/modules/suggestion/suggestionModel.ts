import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// url query: /v1/suggestion/youtube?limit=someNumber

export const youtubeSuggestionQuery = z.object({
  limit: z.number().int().positive(),
});

export type TypeYoutubeSuggestionPayload = z.infer<typeof youtubeSuggestionQuery>;

export const youtubeSuggestionResponse = z.object({
  _id: z.string(),
  videoLink: z.string().url(),
  title: z.string(),
  thumbnails: z.string().url(),
  description: z.string(),
  duration: z.string(),
});

export type TypeYoutubeSuggestionResponse = z.infer<typeof youtubeSuggestionResponse>;
