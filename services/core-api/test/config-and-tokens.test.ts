import { generateKeyPairSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildConfig, loadEnv } from '../src/config/env.js';
import { createTokenService, generateRefreshToken, hashRefreshToken } from '../src/lib/tokens.js';

const claims = { userId: '11111111-1111-4111-8111-111111111111', role: 'doctor' } as const;

// A key written the way scripts/generate-keys.mjs prints it: one line, "\n" escapes.
const envStylePem = () =>
  generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
    .privateKey.trim()
    .replace(/\n/g, '\\n');

describe('token service', () => {
  it('signs and verifies with a configured key (including "\\n"-escaped PEM from .env)', async () => {
    const service = await createTokenService({ privateKeyPem: envStylePem(), ttlSeconds: 60 });
    expect(service.ephemeral).toBe(false);
    const token = await service.signAccessToken(claims);
    expect(await service.verifyAccessToken(token)).toEqual(claims);
  });

  it('uses a throwaway key when none is configured', async () => {
    const service = await createTokenService({ ttlSeconds: 60 });
    expect(service.ephemeral).toBe(true);
    expect(await service.verifyAccessToken(await service.signAccessToken(claims))).toEqual(claims);
  });

  it('does not accept a token signed by a different key', async () => {
    const [a, b] = [await createTokenService({ ttlSeconds: 60 }), await createTokenService({ ttlSeconds: 60 })];
    await expect(a.verifyAccessToken(await b.signAccessToken(claims))).rejects.toMatchObject({ status: 401, code: 'invalid_token' });
  });

  it('gives every published key an id, so keys can be rotated later', async () => {
    const { keys } = await (await createTokenService({ privateKeyPem: envStylePem(), ttlSeconds: 60 })).jwks();
    expect(keys).toHaveLength(1);
    expect(keys[0]?.kid).toEqual(expect.any(String));
  });
});

describe('refresh tokens', () => {
  it('are long, random and hashed deterministically', () => {
    const [a, b] = [generateRefreshToken(), generateRefreshToken()];
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(43);
    expect(hashRefreshToken(a)).toBe(hashRefreshToken(a));
    expect(hashRefreshToken(a)).not.toBe(hashRefreshToken(b));
  });
});

describe('environment', () => {
  const base = { DATABASE_URL: 'postgresql://u:p@localhost:5433/db' };

  it('requires a signing key in production', () => {
    expect(() => loadEnv({ ...base, NODE_ENV: 'production' })).toThrow(/JWT_PRIVATE_KEY/);
    expect(() => loadEnv({ ...base, NODE_ENV: 'production', JWT_PRIVATE_KEY: 'x' })).not.toThrow();
  });

  it('defaults to safe, development-friendly settings', () => {
    const config = buildConfig(loadEnv({ ...base }));
    expect(config).toMatchObject({ accessTokenTtlSeconds: 900, refreshTokenTtlDays: 7, cookieSecure: false, trustProxy: 0 });
  });

  it('sends the refresh cookie over HTTPS only in production unless told otherwise', () => {
    expect(buildConfig(loadEnv({ ...base, NODE_ENV: 'production', JWT_PRIVATE_KEY: 'x' })).cookieSecure).toBe(true);
    expect(buildConfig(loadEnv({ ...base, NODE_ENV: 'production', JWT_PRIVATE_KEY: 'x', COOKIE_SECURE: 'false' })).cookieSecure).toBe(false);
  });

  it('rejects nonsense values', () => {
    expect(() => loadEnv({ ...base, ACCESS_TOKEN_TTL_SECONDS: '5' })).toThrow(/ACCESS_TOKEN_TTL_SECONDS/);
    expect(() => loadEnv({ PORT: '4000' })).toThrow(/DATABASE_URL/);
  });
});
