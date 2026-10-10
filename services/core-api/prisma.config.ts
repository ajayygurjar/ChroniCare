import { defineConfig } from 'prisma/config';

// The Prisma CLI does not read .env by itself (Prisma 7), so load it here. Values that are already
// set in the environment (CI, Docker) win over the file.
try {
  process.loadEnvFile();
} catch {
  // no .env file: rely on the real environment
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // `prisma generate` needs no database, so a missing URL must not break it (Docker image builds,
  // CI installs). Commands that do connect (migrate, studio) fail with Prisma's own error instead.
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
