import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const getHistoryPayload = z.object({
  userId: z.string(),
});

export const getHistoryResponse = z.object({
  _id: z.string(),
  userId: z.string(),
  skill: z.string(),
  date: z.string(),
});

export type TypeGetHistoryPayload = z.infer<typeof getHistoryPayload>;
export type TypeGetHistoryResponse = z.infer<typeof getHistoryResponse>;
