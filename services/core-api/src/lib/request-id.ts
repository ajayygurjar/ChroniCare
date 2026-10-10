import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

// Correlation id (architecture plan, section 5): reuse the id set by the gateway when it looks sane,
// otherwise make one. It is returned in the X-Request-Id header and attached to every log line.
const SAFE_ID = /^[\w.-]{1,128}$/;

export function genReqId(req: IncomingMessage, res: ServerResponse): string {
  const incoming = req.headers['x-request-id'];
  const id = typeof incoming === 'string' && SAFE_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader('X-Request-Id', id);
  return id;
}
