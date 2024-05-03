import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { authRegistry } from '@modules/auth/authRouter';
import { couponRegistry } from '@modules/coupon/couponRoute';
import { feedbackRegistry } from '@modules/feedback/feedbackRoute';
import { healthCheckRegistry } from '@modules/healthCheck/healthCheckRouter';
import { historyRegistry } from '@modules/history/historyRoute';
import { listeningRegistry } from '@modules/listening/listeningRouter';
import { meRegistry } from '@modules/me/meRouter';
import { suggestionRegistry } from '@modules/suggestion/suggestionRoute';
import { userRegistry } from '@modules/user/userRouter';

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([
    healthCheckRegistry,
    userRegistry,
    authRegistry,
    meRegistry,
    suggestionRegistry,
    feedbackRegistry,
    couponRegistry,
    listeningRegistry,
    historyRegistry,
  ]);

  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger API',
    },
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/swagger.json',
    },
  });
}
