import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import z from 'zod';

import { createApiResponse } from '@api-docs/openAPIResponseBuilders';
import verifyToken, { jwtPayload } from '@common/middleware/verifyToken';
import { handleServiceResponse } from '@common/utils/httpHandlers';
import { getHistoryResponse } from '@modules/history/historyModel';
import { historyService } from '@modules/history/historyService';

export const historyRegistry = new OpenAPIRegistry();

historyRegistry.register('History Skill', getHistoryResponse);

const bearerAuth = historyRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

export const historyRoute: Router = (() => {
  const router = express.Router();

  historyRegistry.registerPath({
    method: 'get',
    path: '/v1/history',
    tags: ['History'],
    responses: createApiResponse(z.array(getHistoryResponse), 'Success'),
    security: [{ [bearerAuth.name]: [] }],
  });

  router.get('/', verifyToken, async (req: Request, res: Response) => {
    const { userId } = (req as Request & { user: jwtPayload }).user;
    const serviceResponse = await historyService.getHistory(userId);
    handleServiceResponse(serviceResponse, res);
  });
  return router;
})();
