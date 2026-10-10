import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from './lib/logger.js';
import { genReqId } from './lib/request-id.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { healthRouter, type Database } from './routes/health.js';

export interface AppDeps {
  prisma: Database;
  logger: Logger;
}

// The app is built from its dependencies (no globals), so tests can pass a fake database.
export function createApp({ prisma, logger }: AppDeps): express.Express {
  const app = express();

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

  app.use(healthRouter({ prisma }));
  // Feature routers (auth, appointments, history, prescriptions) mount under /api in Phase 1.

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
