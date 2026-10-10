import type { RequestHandler } from 'express';
import type { Role } from '../generated/prisma/enums.js';
import type { TokenService } from '../lib/tokens.js';
import { HttpError } from './errors.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by requireAuth: who is calling. */
      auth?: { userId: string; role: Role };
    }
  }
}

// Authentication: the caller must send "Authorization: Bearer <access token>".
export function requireAuth(tokens: TokenService): RequestHandler {
  return async (req, _res, next) => {
    const header = req.header('authorization');
    const match = header ? /^Bearer (.+)$/i.exec(header) : null;
    if (!match?.[1]) {
      next(new HttpError(401, 'unauthorized', 'Sign in to continue.'));
      return;
    }
    try {
      req.auth = await tokens.verifyAccessToken(match[1]);
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Authorization by role. Use after requireAuth.
export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      next(new HttpError(403, 'forbidden', 'You do not have permission to do that.'));
      return;
    }
    next();
  };
}

// For handlers that run behind requireAuth: the caller, or a programming error.
export function caller(req: Express.Request): { userId: string; role: Role } {
  if (!req.auth) throw new HttpError(401, 'unauthorized', 'Sign in to continue.');
  return req.auth;
}
