import { z } from 'zod';

// Load .env for local runs. Variables already present in the environment (CI, Docker, a shell)
// are never overridden by the file.
try {
  process.loadEnvFile();
} catch {
  // no .env file: rely on the real environment
}

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.string().min(1, 'is required, e.g. postgresql://user:password@localhost:5433/core_db'),
  TEST_DATABASE_URL: z.string().min(1).optional(),

  // RSA private key (PEM) that signs access tokens. "\n" escapes are accepted. Optional outside
  // production: a throwaway key is generated at startup (sessions then survive restarts through the
  // refresh cookie). Required in production, where the public half is published at /.well-known/jwks.json.
  JWT_PRIVATE_KEY: z.string().min(1).optional(),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().min(60).default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  // Send the refresh cookie over HTTPS only. Defaults to true in production, false otherwise.
  COOKIE_SECURE: z.stringbool().optional(),
  // Failed-login protection: attempts per IP per 15 minutes on /api/auth/login and /signup.
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(20),
  // How many reverse proxies (gateway, load balancer) sit in front of the API. Needed for correct client IPs.
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  const env = parsed.data;

  if (env.NODE_ENV === 'production' && !env.JWT_PRIVATE_KEY) {
    throw new Error('Invalid environment configuration:\n  - JWT_PRIVATE_KEY: is required in production');
  }

  if (env.NODE_ENV === 'test') {
    // Tests wipe tables, so they must never run against the development database.
    if (env.TEST_DATABASE_URL) {
      return { ...env, DATABASE_URL: env.TEST_DATABASE_URL };
    }
    if (source.CI !== 'true') {
      throw new Error(
        'Refusing to run tests against DATABASE_URL. Set TEST_DATABASE_URL to a separate test database ' +
          '(see .env.example).',
      );
    }
  }
  return env;
}

// The runtime settings the app needs, separated from raw environment variables.
export interface AppConfig {
  accessTokenTtlSeconds: number;
  refreshTokenTtlDays: number;
  cookieSecure: boolean;
  authRateLimitMax: number;
  trustProxy: number;
}

export function buildConfig(env: Env): AppConfig {
  return {
    accessTokenTtlSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlDays: env.REFRESH_TOKEN_TTL_DAYS,
    cookieSecure: env.COOKIE_SECURE ?? env.NODE_ENV === 'production',
    authRateLimitMax: env.AUTH_RATE_LIMIT_MAX,
    trustProxy: env.TRUST_PROXY,
  };
}
