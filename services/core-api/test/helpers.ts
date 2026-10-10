import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadEnv, type AppConfig } from '../src/config/env.js';
import { createLogger } from '../src/lib/logger.js';
import { createPrisma, type PrismaClient } from '../src/lib/prisma.js';
import { createTokenService } from '../src/lib/tokens.js';

export function createTestPrisma(): PrismaClient {
  return createPrisma(loadEnv().DATABASE_URL); // in NODE_ENV=test this is the test database
}

// Empties every table (and only the test database: loadEnv refuses anything else).
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE refresh_tokens, prescription_items, prescriptions, prescription_uploads, medical_history,
       appointments, patient_profiles, doctor_profiles, users RESTART IDENTITY CASCADE`,
  );
}

// Direct database inserts for tests that check the schema itself (no API involved).
let userCounter = 0;
export function makeUser(prisma: PrismaClient, role: 'patient' | 'doctor', email?: string) {
  userCounter += 1;
  return prisma.user.create({
    data: { email: email ?? `${role}${userCounter}@example.com`, passwordHash: 'not-a-real-hash', role },
  });
}

const logger = createLogger({ NODE_ENV: 'test', LOG_LEVEL: 'silent' });

export const testConfig: AppConfig = {
  accessTokenTtlSeconds: 900,
  refreshTokenTtlDays: 7,
  cookieSecure: false,
  authRateLimitMax: 1000, // effectively off; the rate-limit test lowers it
  trustProxy: 0,
};

// A fully wired app. `prisma` may be a fake for tests that never reach the database.
export async function buildApp(prisma: unknown, overrides: { config?: Partial<AppConfig>; ttlSeconds?: number } = {}) {
  const config = { ...testConfig, ...overrides.config };
  const tokens = await createTokenService({ ttlSeconds: overrides.ttlSeconds ?? config.accessTokenTtlSeconds });
  const app = createApp({ prisma: prisma as PrismaClient, logger, tokens, config });
  return { app, tokens, config };
}

// ---- building blocks for API tests ----

export const PASSWORD = 'correct horse battery';
export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
/** "name=value" of the refresh cookie from a response, ready to send back in a Cookie header. */
export const refreshCookie = (res: request.Response): string => {
  const header = (res.headers['set-cookie'] as unknown as string[] | undefined)?.find((c) => c.startsWith('chronicare_rt='));
  if (!header) throw new Error('response has no refresh cookie');
  return header.split(';')[0]!;
};

let counter = 0;
export function signupBody(role: 'patient' | 'doctor', overrides: Record<string, unknown> = {}) {
  counter += 1;
  return {
    role,
    email: `${role}${counter}@example.com`,
    password: PASSWORD,
    firstName: role === 'doctor' ? 'Rohan' : 'Asha',
    lastName: `${role === 'doctor' ? 'Rao' : 'Kapoor'}${counter}`,
    gender: 'Female',
    dateOfBirth: '1990-04-25',
    phone: '98765 43210',
    address: 'Pune, MH',
    ...(role === 'doctor' ? { speciality: 'Cardiologist', experience: 12 } : {}),
    ...overrides,
  };
}

export interface Account {
  id: string;
  token: string;
  cookie: string;
  email: string;
}

export async function register(app: Parameters<typeof request>[0], role: 'patient' | 'doctor', overrides = {}): Promise<Account> {
  const body = signupBody(role, overrides);
  const res = await request(app).post('/api/auth/signup').send(body);
  if (res.status !== 201) throw new Error(`signup failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { id: res.body.user.id, token: res.body.accessToken, cookie: refreshCookie(res), email: body.email };
}

/** A moment `days` from now at 10:00 UTC (always in the future, always the same slot). */
export function inDays(days: number, hourUtc = 10): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hourUtc, 0, 0, 0);
  return d;
}

export async function book(app: Parameters<typeof request>[0], patient: Account, doctorId: string, when: Date, reason = 'Check-up') {
  return request(app)
    .post('/api/appointments')
    .set(bearer(patient.token))
    .send({ doctorId, scheduledAt: when.toISOString(), reason });
}

export async function setStatus(app: Parameters<typeof request>[0], doctor: Account, appointmentId: string, status: string) {
  return request(app).patch(`/api/appointments/${appointmentId}/status`).set(bearer(doctor.token)).send({ status });
}
