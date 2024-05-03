import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export type TypeListeningResponse = z.infer<typeof linkYoutubeResponse>;
export const linkYoutubeResponse = z.object({
  id: z.string(),
  form: z.array(
    z.object({
      question: z.string(),
      choices: z.object({
        A: z.string(),
        B: z.string(),
        C: z.string(),
        D: z.string(),
      }),
      explanation: z.string(),
      answer: z.string(),
    }),
  ),
});

export const markListeningResponse = z.object({
  score: z.string(),
});

export const genListeningPayload = z.object({
  linkYoutube: z.string().url(),
  userId: z.string(),
});

export const markListeningPayload = z.object({
  results: z.array(z.string()),
  hash: z.string(),
});

export const dbListeningResponse = z.object({
  _id: z.string(),
  url: z.string().url(),
  resultId: z.string(),
  result: linkYoutubeResponse,
  createdAt: z.date(),
});

export type TypeMarkListeningPayload = z.infer<typeof markListeningPayload>;
export type TypeGenListeningPayload = z.infer<typeof genListeningPayload>;
export type TypeDbListeningResponse = z.infer<typeof dbListeningResponse>;
