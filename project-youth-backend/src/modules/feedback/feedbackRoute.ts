import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';

import { createApiResponse } from '@api-docs/openAPIResponseBuilders';
import verifyToken, { jwtPayload } from '@common/middleware/verifyToken';
import { handleServiceResponse } from '@common/utils/httpHandlers';
import { FeedbackResponse } from '@modules/feedback/feedbackModel';
import { feedbackService } from '@modules/feedback/feedbackService';

export const feedbackRegistry = new OpenAPIRegistry();
feedbackRegistry.register('Feedback', FeedbackResponse);

const bearerAuth = feedbackRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

export const feedbackRouter: Router = (() => {
  const router = express.Router();

  feedbackRegistry.registerPath({
    method: 'post',
    path: '/v1/feedback',
    tags: ['Feedback'],
    responses: createApiResponse(FeedbackResponse, 'Success'),
    security: [{ [bearerAuth.name]: [] }],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              feedback: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  });

  router.post('/', verifyToken, async (_req: Request, res: Response) => {
    // req after middleware and validation
    const req = _req as Request & { user: jwtPayload & { feedback: string } }; // Update type definition
    const { userId, email } = req.user;
    const {
      feedback,
    }: {
      feedback: string;
    } = req.body;

    const serviceResponse = await feedbackService.createFeedback(userId, email, feedback);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();
