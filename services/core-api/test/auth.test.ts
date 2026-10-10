import { createLocalJWKSet, jwtVerify } from 'jose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { PrismaClient } from '../src/lib/prisma.js';
import { AUDIENCE, ISSUER } from '../src/lib/tokens.js';
import {
  PASSWORD,
  bearer,
  buildApp,
  createTestPrisma,
  refreshCookie,
  register,
  resetDatabase,
  signupBody,
} from './helpers.js';

let prisma: PrismaClient;
let app: Awaited<ReturnType<typeof buildApp>>['app'];
let tokens: Awaited<ReturnType<typeof buildApp>>['tokens'];

beforeAll(async () => {
  prisma = createTestPrisma();
  ({ app, tokens } = await buildApp(prisma));
});
beforeEach(() => resetDatabase(prisma));
afterAll(() => prisma.$disconnect());

describe('POST /api/auth/signup', () => {
  it('creates a patient, returns an access token and sets an httpOnly refresh cookie', async () => {
    const res = await request(app).post('/api/auth/signup').send(signupBody('patient'));

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ role: 'patient', firstName: 'Asha', gender: 'Female', dateOfBirth: '1990-04-25' });
    expect(res.body.user.age).toBeGreaterThanOrEqual(36);
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);

    const cookie = (res.headers['set-cookie'] as unknown as string[])[0]!;
    expect(cookie).toMatch(/^chronicare_rt=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Path=\/api\/auth/);
  });

  it('creates a doctor with speciality and experience', async () => {
    const res = await request(app).post('/api/auth/signup').send(signupBody('doctor', { speciality: 'Dermatologist', experience: '7' }));
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ role: 'doctor', speciality: 'Dermatologist', experience: 7 });
  });

  it('stores only a hash of the password', async () => {
    await request(app).post('/api/auth/signup').send(signupBody('patient', { email: 'hash@example.com' }));
    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'hash@example.com' } });
    expect(user.passwordHash).toMatch(/^\$argon2id\$/);
    expect(user.passwordHash).not.toContain(PASSWORD);
  });

  it.each([
    ['a short password', { password: 'short' }, /password/],
    ['an invalid email', { email: 'not-an-email' }, /email/],
    ['a date of birth in the future', { dateOfBirth: '2999-01-01' }, /dateOfBirth/],
    ['a missing first name', { firstName: '' }, /firstName/],
    ['an unknown gender', { gender: 'Robot' }, /gender/],
  ])('rejects %s with a readable 400', async (_label, override, field) => {
    const res = await request(app).post('/api/auth/signup').send(signupBody('patient', override));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
    expect(res.body.error.message).toMatch(field);
  });

  it('requires speciality for doctors', async () => {
    const res = await request(app).post('/api/auth/signup').send(signupBody('doctor', { speciality: '' }));
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/speciality/);
  });

  it('refuses to create admins or unknown roles', async () => {
    const res = await request(app).post('/api/auth/signup').send(signupBody('patient', { role: 'admin' }));
    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email regardless of letter case', async () => {
    await request(app).post('/api/auth/signup').send(signupBody('patient', { email: 'Asha@Example.com' }));
    const res = await request(app).post('/api/auth/signup').send(signupBody('doctor', { email: 'asha@example.COM' }));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('email_taken');
  });
});

describe('POST /api/auth/login', () => {
  it('signs in with the right password', async () => {
    const account = await register(app, 'patient');
    const res = await request(app).post('/api/auth/login').send({ email: account.email, password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(account.id);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(refreshCookie(res)).toMatch(/^chronicare_rt=/);
  });

  it('answers a wrong password and an unknown email identically', async () => {
    const account = await register(app, 'patient');
    const wrongPassword = await request(app).post('/api/auth/login').send({ email: account.email, password: 'nope nope nope' });
    const unknownEmail = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: PASSWORD });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.error.code).toBe('invalid_credentials');
    expect(unknownEmail.body.error.message).toBe(wrongPassword.body.error.message);
  });

  it('reports a role mismatch only after the password is verified', async () => {
    const patient = await register(app, 'patient');

    const right = await request(app).post('/api/auth/login').send({ email: patient.email, password: PASSWORD, expectedRole: 'doctor' });
    expect(right.status).toBe(403);
    expect(right.body.error.code).toBe('role_mismatch');

    const wrong = await request(app).post('/api/auth/login').send({ email: patient.email, password: 'bad bad bad', expectedRole: 'doctor' });
    expect(wrong.status).toBe(401); // does not reveal which role the account has
  });

  it('is case-insensitive on email', async () => {
    const account = await register(app, 'patient', { email: 'Mixed@Example.com' });
    const res = await request(app).post('/api/auth/login').send({ email: 'MIXED@example.com', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(account.id);
  });
});

describe('access tokens', () => {
  it('GET /api/auth/me returns the signed-in user', async () => {
    const account = await register(app, 'doctor');
    const res = await request(app).get('/api/auth/me').set(bearer(account.token));
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: account.id, role: 'doctor', speciality: 'Cardiologist' });
  });

  it('rejects a missing, malformed or tampered token', async () => {
    const account = await register(app, 'patient');
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set(bearer('garbage'))).status).toBe(401);

    const tampered = account.token.slice(0, -4) + (account.token.endsWith('AAAA') ? 'BBBB' : 'AAAA');
    const res = await request(app).get('/api/auth/me').set(bearer(tampered));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('invalid_token');
  });

  it('rejects an expired token with a distinct code', async () => {
    const short = await buildApp(prisma, { ttlSeconds: 1 });
    const account = await register(short.app, 'patient');
    await new Promise((resolve) => setTimeout(resolve, 2200));
    const res = await request(short.app).get('/api/auth/me').set(bearer(account.token));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('token_expired');
  });

  it('publishes a public key that verifies the tokens (how other services will check them)', async () => {
    const account = await register(app, 'patient');
    const jwks = await request(app).get('/.well-known/jwks.json');
    expect(jwks.status).toBe(200);
    expect(jwks.body.keys[0]).toMatchObject({ kty: 'RSA', alg: 'RS256', use: 'sig' });
    expect(jwks.body.keys[0].d).toBeUndefined(); // never the private half

    const { payload } = await jwtVerify(account.token, createLocalJWKSet(jwks.body), { issuer: ISSUER, audience: AUDIENCE });
    expect(payload.sub).toBe(account.id);
    expect(payload.role).toBe('patient');
    expect(await tokens.jwks()).toEqual(jwks.body);
  });
});

describe('sessions (refresh cookie)', () => {
  it('POST /api/auth/refresh issues a new access token and rotates the refresh cookie', async () => {
    const account = await register(app, 'patient');
    const res = await request(app).post('/api/auth/refresh').set('Cookie', account.cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(account.id);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(refreshCookie(res)).not.toBe(account.cookie);

    const me = await request(app).get('/api/auth/me').set(bearer(res.body.accessToken));
    expect(me.status).toBe(200);
  });

  it('needs a cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('no_session');
  });

  it('stores only a hash of the refresh token', async () => {
    const account = await register(app, 'patient');
    const raw = account.cookie.split('=')[1]!;
    const rows = await prisma.refreshToken.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tokenHash).not.toBe(raw);
    expect(rows[0]!.tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('accepts a just-rotated token (two tabs refreshing at once) but not an old replayed one', async () => {
    const account = await register(app, 'patient');
    const second = await register(app, 'patient'); // another user, to prove only the thief's sessions end

    await request(app).post('/api/auth/refresh').set('Cookie', account.cookie).expect(200);
    // Replayed within the grace window: fine.
    await request(app).post('/api/auth/refresh').set('Cookie', account.cookie).expect(200);

    // Age the first rotation past the grace window, then replay: treated as theft.
    await prisma.refreshToken.updateMany({
      where: { revokedAt: { not: null } },
      data: { revokedAt: new Date(Date.now() - 60_000) },
    });
    const replay = await request(app).post('/api/auth/refresh').set('Cookie', account.cookie);
    expect(replay.status).toBe(401);
    expect(replay.body.error.code).toBe('session_revoked');

    // Every session of that user is now gone; other users are unaffected.
    expect(await prisma.refreshToken.count({ where: { userId: account.id } })).toBe(0);
    await request(app).post('/api/auth/refresh').set('Cookie', second.cookie).expect(200);
  });

  it('logout ends the session at once and clears the cookie', async () => {
    const account = await register(app, 'patient');
    const out = await request(app).post('/api/auth/logout').set('Cookie', account.cookie);
    expect(out.status).toBe(204);
    expect((out.headers['set-cookie'] as unknown as string[])[0]).toMatch(/chronicare_rt=;/);

    // Immediately afterwards, even inside the rotation grace window, the old cookie is useless.
    await request(app).post('/api/auth/refresh').set('Cookie', account.cookie).expect(401);
    expect(await prisma.refreshToken.count({ where: { userId: account.id } })).toBe(0);
  });

  it('rejects an expired refresh token', async () => {
    const account = await register(app, 'patient');
    await prisma.refreshToken.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
    const res = await request(app).post('/api/auth/refresh').set('Cookie', account.cookie);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('invalid_session');
  });
});

describe('brute-force protection', () => {
  it('answers 429 after too many login attempts', async () => {
    const limited = await buildApp(prisma, { config: { authRateLimitMax: 3 } });
    const attempt = () => request(limited.app).post('/api/auth/login').send({ email: 'x@example.com', password: 'whatever1' });

    for (let i = 0; i < 3; i++) expect((await attempt()).status).toBe(401);
    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('too_many_requests');
  });
});
