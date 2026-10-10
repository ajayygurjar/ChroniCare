import cookieParser from 'cookie-parser';
import express, { Router } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { AppConfig } from './config/env.js';
import type { Logger } from './lib/logger.js';
import type { PrismaClient } from './lib/prisma.js';
import { genReqId } from './lib/request-id.js';
import type { TokenService } from './lib/tokens.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { appointmentsRouter } from './modules/appointments/routes.js';
import { authRouter } from './modules/auth/routes.js';
import { doctorsRouter } from './modules/doctors/routes.js';
import { historyRouter } from './modules/history/routes.js';
import { patientsRouter } from './modules/patients/routes.js';
import { healthRouter } from './routes/health.js';

export interface AppDeps {
  prisma: PrismaClient;
  logger: Logger;
  tokens: TokenService;
  config: AppConfig;
}

// The app is built from its dependencies (no globals), so tests can pass their own.
export function createApp(deps: AppDeps): express.Express {
  const { prisma, logger, tokens, config } = deps;
  const app = express();

  // Behind a gateway or load balancer, trust its X-Forwarded-* headers so client IPs (rate limits, logs) are right.
  if (config.trustProxy > 0) app.set('trust proxy', config.trustProxy);

  app.use(
    pinoHttp({
      logger,
      genReqId,
      autoLogging: { ignore: (req) => req.url === '/health' },
      // Log only what is needed to trace a request. No headers, so no tokens or cookies in logs.
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use(healthRouter({ prisma }));

  // Public key for verifying access tokens (used by other services).
  app.get('/.well-known/jwks.json', async (_req, res) => {
    res.set('Cache-Control', 'public, max-age=300').json(await tokens.jwks());
  });

  const modules = { prisma, tokens, config };
  const api = Router();
  api.use('/auth', authRouter(modules));
  api.use('/doctors', doctorsRouter(modules));
  api.use('/patients', patientsRouter(modules));
  api.use('/appointments', appointmentsRouter(modules));
  api.use('/history', historyRouter(modules));
  app.use('/api', api);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
