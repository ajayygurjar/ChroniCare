import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, randomBytes, type KeyObject } from 'node:crypto';
import { SignJWT, calculateJwkThumbprint, errors, exportJWK, jwtVerify, type JWK } from 'jose';
import type { Role } from '../generated/prisma/enums.js';
import { HttpError } from '../middleware/errors.js';

// Access tokens: short-lived RS256 JWTs. Other services (the Java payment service later) verify them
// with the public key published at /.well-known/jwks.json, so they never need the private key.
export const ISSUER = 'chronicare-core-api';
export const AUDIENCE = 'chronicare';

export interface AccessClaims {
  userId: string;
  role: Role;
}

export interface TokenService {
  signAccessToken(claims: AccessClaims): Promise<string>;
  verifyAccessToken(token: string): Promise<AccessClaims>;
  jwks(): Promise<{ keys: JWK[] }>;
}

const ROLES: readonly string[] = ['patient', 'doctor', 'admin'];

export async function createTokenService(options: {
  privateKeyPem?: string | undefined;
  ttlSeconds: number;
}): Promise<TokenService & { ephemeral: boolean }> {
  let privateKey: KeyObject;
  let publicKey: KeyObject;
  const ephemeral = !options.privateKeyPem;
  if (options.privateKeyPem) {
    privateKey = createPrivateKey(options.privateKeyPem.replace(/\\n/g, '\n'));
    publicKey = createPublicKey(privateKey);
  } else {
    ({ privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 }));
  }

  const publicJwk = await exportJWK(publicKey);
  const kid = await calculateJwkThumbprint(publicJwk);
  const jwk: JWK = { ...publicJwk, kid, alg: 'RS256', use: 'sig' };

  return {
    ephemeral,

    signAccessToken({ userId, role }) {
      return new SignJWT({ role })
        .setProtectedHeader({ alg: 'RS256', kid })
        .setSubject(userId)
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(`${options.ttlSeconds}s`)
        .sign(privateKey);
    },

    async verifyAccessToken(token) {
      try {
        const { payload } = await jwtVerify(token, publicKey, {
          issuer: ISSUER,
          audience: AUDIENCE,
          algorithms: ['RS256'],
        });
        const role = payload.role;
        if (!payload.sub || typeof role !== 'string' || !ROLES.includes(role)) {
          throw new HttpError(401, 'invalid_token', 'Invalid access token.');
        }
        return { userId: payload.sub, role: role as Role };
      } catch (err) {
        if (err instanceof HttpError) throw err;
        if (err instanceof errors.JWTExpired) throw new HttpError(401, 'token_expired', 'Access token expired.');
        throw new HttpError(401, 'invalid_token', 'Invalid access token.');
      }
    },

    async jwks() {
      return { keys: [jwk] };
    },
  };
}

// Refresh tokens are opaque random strings. The database stores only their SHA-256 hash.
export function generateRefreshToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
