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
});

export type Env = z.infer<typeof schema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  const env = parsed.data;

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
