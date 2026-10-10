import { execSync } from 'node:child_process';
import { loadEnv } from '../src/config/env.js';

// Runs once before the test files: brings the TEST database up to the latest migration.
export default function setup(): void {
  const env = loadEnv({ ...process.env, NODE_ENV: 'test' }); // throws if it would hit the dev database
  try {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: env.DATABASE_URL },
      stdio: 'pipe',
    });
  } catch (err) {
    const output = err instanceof Error && 'stdout' in err ? String((err as { stdout: Buffer }).stdout) : '';
    throw new Error(`Could not migrate the test database. Is Postgres running (docker compose up -d)?\n${output}`, {
      cause: err,
    });
  }
}
