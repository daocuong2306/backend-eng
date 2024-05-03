import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { createApiResponse } from '@api-docs/openAPIResponseBuilders';
import verifyToken, { jwtPayload } from '@common/middleware/verifyToken';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { handleServiceResponse, validateRequest } from '@common/utils/httpHandlers';
import {
  genListeningPayload,
  linkYoutubeResponse,
  markListeningPayload,
  markListeningResponse,
} from '@modules/listening/listeningModel';
import { listeningService } from '@modules/listening/listeningService';

export const listeningRegistry = new OpenAPIRegistry();

const bearerAuth = listeningRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

export const listeningRouter: Router = (() => {
  const router = express.Router();

  listeningRegistry.registerPath({
    method: 'post',
    path: '/v1/listening/gen-quizz',
    tags: ['Listening'],
    responses: createApiResponse(linkYoutubeResponse, 'Success'),
    security: [{ [bearerAuth.name]: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              linkYoutube: { type: 'string' },
            },
            required: ['linkYoutube'],
          },
        },
      },
    },
  });

  router.post('/gen-quizz', verifyToken, async (_req: Request, res: Response) => {
    const { linkYoutube } = _req.body;
    const { userId } = (_req as Request & { user: jwtPayload }).user;
    // validate request
    const payload = genListeningPayload.safeParse({ linkYoutube, userId });
    if (!payload.success) {
      const errorMessage = payload.error.issues.map((issue) => issue.message).join(', ');
      const serviceResponse = new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.BAD_REQUEST);
      handleServiceResponse(serviceResponse, res);
      return;
    }
    // call service
    const serviceResponse = await listeningService.postListening(linkYoutube, userId);
    handleServiceResponse(serviceResponse, res);
  });
  //mark listening
  listeningRegistry.registerPath({
    method: 'post',
    path: '/v1/listening/mark-listening',
    tags: ['Listening'],
    responses: createApiResponse(markListeningResponse, 'Success'),
    security: [{ [bearerAuth.name]: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              results: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              hash: { type: 'string' },
            },
            required: ['results', 'hash'],
          },
        },
      },
    },
  });

  router.post(
    '/mark-listening',
    verifyToken,
    validateRequest(markListeningPayload),
    async (_req: Request, res: Response) => {
      const { results, hash } = _req.body;
      // validate request
      // const payload = markListeningPayload.safeParse({ results, hash });

      // if (!payload.success) {
      //   const errorMessage = payload.error.issues.map((issue) => issue.message).join(', ');
      //   const serviceResponse = new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.BAD_REQUEST);
      //   handleServiceResponse(serviceResponse, res);
      //   return;
      // }
      // call service
      const serviceResponse = await listeningService.markListening(results, hash);
      handleServiceResponse(serviceResponse, res);
    },
  );
  return router;
})();
