import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { createLogger } from '../src/lib/logger.js';
import type { Database } from '../src/routes/health.js';
import { createTestPrisma } from './helpers.js';

const logger = createLogger({ NODE_ENV: 'test', LOG_LEVEL: 'silent' });

const fakeDb = (queryRaw: () => Promise<unknown>): Database => ({ $queryRaw: queryRaw });

describe('GET /health', () => {
  const app = createApp({ prisma: fakeDb(async () => 1), logger });

  it('reports liveness without touching the database', async () => {
    const queryRaw = vi.fn();
    const res = await request(createApp({ prisma: fakeDb(queryRaw), logger })).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it('returns a request id, and reuses a sane one sent by the gateway', async () => {
    const generated = await request(app).get('/health');
    expect(generated.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);

    const reused = await request(app).get('/health').set('X-Request-Id', 'gw-123.abc');
    expect(reused.headers['x-request-id']).toBe('gw-123.abc');

    const rejected = await request(app).get('/health').set('X-Request-Id', 'bad id with spaces!');
    expect(rejected.headers['x-request-id']).not.toBe('bad id with spaces!');
  });

  it('sets security headers', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('GET /ready', () => {
  it('is 200 when the database answers', async () => {
    const res = await request(createApp({ prisma: fakeDb(async () => [{ '?column?': 1 }]), logger })).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ready', checks: { database: 'ok' } });
  });

  it('is 503 when the database is down, without leaking the error', async () => {
    const down = fakeDb(async () => {
      throw new Error('connect ECONNREFUSED 10.0.0.5:5432 password=secret');
    });
    const res = await request(createApp({ prisma: down, logger })).get('/ready');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'unavailable', checks: { database: 'error' } });
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });

  it('is 200 against the real test database', async () => {
    const prisma = createTestPrisma();
    try {
      const res = await request(createApp({ prisma, logger })).get('/ready');
      expect(res.status).toBe(200);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe('error handling', () => {
  const app = createApp({ prisma: fakeDb(async () => 1), logger });

  it('answers unknown routes with a JSON 404 that carries the request id', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'not_found', requestId: res.headers['x-request-id'] });
  });

  it('answers malformed JSON with a 400, not a 500', async () => {
    const res = await request(app).post('/anything').set('Content-Type', 'application/json').send('{"broken":');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('bad_request');
  });
});
