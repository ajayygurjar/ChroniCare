import type { Request, Response } from 'express';
import type { AppConfig } from '../../config/env.js';
import { generateRefreshToken, hashRefreshToken } from '../../lib/tokens.js';
import { HttpError } from '../../middleware/errors.js';
import { userDto, withProfiles, type UserWithProfiles } from '../dto.js';
import type { ModuleDeps } from '../types.js';

export const REFRESH_COOKIE = 'chronicare_rt';

// A refresh token that was rotated a moment ago may legitimately arrive again: two tabs, or React
// StrictMode, refreshing at the same instant. Inside this window it is accepted instead of
// treated as theft.
const REUSE_GRACE_MS = 10_000;

function setRefreshCookie(res: Response, config: AppConfig, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true, // not readable by page scripts, so XSS cannot steal it
    secure: config.cookieSecure,
    sameSite: 'lax',
    path: '/api/auth', // sent only to the auth endpoints
    maxAge: config.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res: Response, config: AppConfig): void {
  res.clearCookie(REFRESH_COOKIE, { httpOnly: true, secure: config.cookieSecure, sameSite: 'lax', path: '/api/auth' });
}

// Opens a session: a fresh refresh token (cookie + database row) and a short-lived access token.
export async function startSession({ prisma, tokens, config }: ModuleDeps, res: Response, user: UserWithProfiles) {
  const refreshToken = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000),
    },
  });
  setRefreshCookie(res, config, refreshToken);
  const accessToken = await tokens.signAccessToken({ userId: user.id, role: user.role });
  return { accessToken, user: userDto(user) };
}

// Exchanges the refresh cookie for a new session. Every use replaces the token.
export async function rotateSession(deps: ModuleDeps, req: Request, res: Response) {
  const { prisma, config } = deps;
  const raw: unknown = req.cookies?.[REFRESH_COOKIE];
  if (typeof raw !== 'string' || raw === '') {
    throw new HttpError(401, 'no_session', 'You are not signed in.');
  }

  const row = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashRefreshToken(raw) },
    include: { user: { include: withProfiles } },
  });
  const now = new Date();

  if (!row || row.expiresAt <= now) {
    clearRefreshCookie(res, config);
    throw new HttpError(401, 'invalid_session', 'Your session has expired. Please sign in again.');
  }

  // revokedAt means "replaced by a newer token" (rotation). Ending a session deletes its rows instead,
  // so a logged-out token can never come back through the grace window below.
  if (row.revokedAt) {
    if (now.getTime() - row.revokedAt.getTime() > REUSE_GRACE_MS) {
      // A token that was already replaced came back: assume it was stolen and end every session.
      await prisma.refreshToken.deleteMany({ where: { userId: row.userId } });
      clearRefreshCookie(res, config);
      throw new HttpError(401, 'session_revoked', 'Your session was ended. Please sign in again.');
    }
  } else {
    await prisma.refreshToken.updateMany({ where: { id: row.id, revokedAt: null }, data: { revokedAt: now } });
  }

  return startSession(deps, res, row.user);
}

export async function endSession({ prisma, config }: ModuleDeps, req: Request, res: Response): Promise<void> {
  const raw: unknown = req.cookies?.[REFRESH_COOKIE];
  if (typeof raw === 'string' && raw !== '') {
    await prisma.refreshToken.deleteMany({ where: { tokenHash: hashRefreshToken(raw) } });
  }
  clearRefreshCookie(res, config);
}
