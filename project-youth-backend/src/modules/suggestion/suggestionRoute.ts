import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@api-docs/openAPIResponseBuilders';
import { handleServiceResponse } from '@common/utils/httpHandlers';
import { youtubeSuggestionQuery, youtubeSuggestionResponse } from '@modules/suggestion/suggestionModel';
import { suggestionService } from '@modules/suggestion/suggetionService';

export const suggestionRegistry = new OpenAPIRegistry();

export const suggestionRouter: Router = (() => {
  const router = express.Router();

  suggestionRegistry.registerPath({
    method: 'get',
    path: '/v1/suggestion/youtube-suggestion',
    tags: ['Suggestions'],
    responses: createApiResponse(z.array(youtubeSuggestionResponse), 'Success'),
    request: {
      query: youtubeSuggestionQuery,
    },
  });

  router.get('/youtube-suggestion', async (_req: Request, res: Response) => {
    const { limit } = _req.query as { limit: string };
    const parsedLimit = parseInt(limit);
    const serviceResponse = await suggestionService.getYoutubeSuggestion(parsedLimit);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();
