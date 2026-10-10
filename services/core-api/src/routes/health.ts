import { Router } from 'express';

// All the routes need from the database layer. PrismaClient satisfies it, and tests can fake it.
export interface Database {
  $queryRaw(query: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
}

// /health = liveness (the process is up). /ready = readiness (it can actually serve: DB reachable).
// Orchestrators and the gateway use these; they are not part of the public /api surface.
export function healthRouter({ prisma }: { prisma: Database }): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get('/ready', async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ready', checks: { database: 'ok' } });
    } catch (err) {
      req.log.error({ err }, 'readiness check failed');
      res.status(503).json({ status: 'unavailable', checks: { database: 'error' } });
    }
  });

  return router;
}
