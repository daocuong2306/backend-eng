import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const FeedbackPayload = z
  .object({
    feedback: z.string(),
    email: z.string().email().trim().toLowerCase(),
    userId: z.string(),
  })
  .strict();

export type TypeFeedbackPayload = z.infer<typeof FeedbackPayload>;

export const FeedbackResponse = z.object({
  _id: z.string(),
  feedback: z.string(),
  email: z.string().email().trim().toLowerCase(),
  userId: z.string(),
  createdAt: z.date(),
});

export type TypeFeedbackResponse = z.infer<typeof FeedbackResponse>;
