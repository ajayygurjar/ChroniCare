import { createApp } from './app.js';
import { buildConfig, loadEnv } from './config/env.js';
import { createLogger } from './lib/logger.js';
import { createPrisma } from './lib/prisma.js';
import { createTokenService } from './lib/tokens.js';

const env = loadEnv();
const logger = createLogger(env);
const prisma = createPrisma(env.DATABASE_URL);
const config = buildConfig(env);
const tokens = await createTokenService({ privateKeyPem: env.JWT_PRIVATE_KEY, ttlSeconds: config.accessTokenTtlSeconds });
if (tokens.ephemeral) {
  logger.warn('JWT_PRIVATE_KEY is not set: using a throwaway signing key. Fine for development; sessions refresh themselves after a restart.');
}

const app = createApp({ prisma, logger, tokens, config });

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'core-api listening');
});

// Finish in-flight requests, release the DB pool, then exit. Docker/Kubernetes send SIGTERM.
function shutdown(signal: string): void {
  logger.info({ signal }, 'shutting down');
  server.close(() => {
    prisma
      .$disconnect()
      .catch((err: unknown) => logger.error({ err }, 'error while disconnecting from the database'))
      .finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
