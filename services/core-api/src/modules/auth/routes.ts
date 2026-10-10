import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { isUniqueViolation } from '../../lib/prisma-errors.js';
import { getDummyHash, hashPassword, verifyPassword } from '../../lib/password.js';
import { caller, requireAuth } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/errors.js';
import { parse } from '../../middleware/validate.js';
import { userDto, withProfiles } from '../dto.js';
import type { ModuleDeps } from '../types.js';
import { endSession, rotateSession, startSession } from './sessions.js';

const name = z.string().trim().min(1, 'is required').max(80);
const email = z.string().trim().toLowerCase().pipe(z.email({ message: 'must be a valid email address' }));
const password = z.string().min(8, 'must be at least 8 characters').max(128, 'is too long');

const dateOfBirth = z.iso
  .date({ message: 'must be a date like 1990-04-25' })
  .refine((value) => new Date(`${value}T00:00:00.000Z`) <= new Date(), 'cannot be in the future')
  .refine((value) => new Date(`${value}T00:00:00.000Z`).getUTCFullYear() >= new Date().getUTCFullYear() - 120, 'is not a valid date of birth')
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

const person = {
  email,
  password,
  firstName: name,
  lastName: name,
  gender: z.enum(['Male', 'Female', 'Other'], { message: 'must be Male, Female or Other' }),
  dateOfBirth,
  phone: z.string().trim().min(5, 'is too short').max(30, 'is too long'),
  address: z.string().trim().min(1, 'is required').max(200),
};

const signupSchema = z.discriminatedUnion('role', [
  z.object({ role: z.literal('patient'), ...person }),
  z.object({
    role: z.literal('doctor'),
    ...person,
    speciality: z.string().trim().min(1, 'is required').max(80),
    experience: z.coerce.number().int('must be a whole number').min(0).max(70),
  }),
]);

const loginSchema = z.object({
  email: z.string().trim().min(1, 'is required'),
  password: z.string().min(1, 'is required'),
  // The role picked on the login screen. A mismatch is reported instead of silently signing in as the other role.
  expectedRole: z.enum(['patient', 'doctor']).optional(),
});

export function authRouter(deps: ModuleDeps): Router {
  const { prisma, tokens, config } = deps;
  const router = Router();

  // Slows down password guessing. In-memory, so per process; a shared store (Redis) comes with a second instance.
  const attemptLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.authRateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new HttpError(429, 'too_many_requests', 'Too many attempts. Try again in a few minutes.')),
  });

  router.post('/signup', attemptLimiter, async (req, res) => {
    const input = parse(signupSchema, req.body);
    const passwordHash = await hashPassword(input.password);
    const profile = {
      firstName: input.firstName,
      lastName: input.lastName,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      phone: input.phone,
      address: input.address,
    };

    try {
      const user = await prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          role: input.role,
          ...(input.role === 'patient'
            ? { patientProfile: { create: profile } }
            : {
                doctorProfile: {
                  create: { ...profile, specialization: input.speciality, experienceYears: input.experience },
                },
              }),
        },
        include: withProfiles,
      });
      res.status(201).json(await startSession(deps, res, user));
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new HttpError(409, 'email_taken', 'An account with this email already exists. Try logging in instead.');
      }
      throw err;
    }
  });

  router.post('/login', attemptLimiter, async (req, res) => {
    const input = parse(loginSchema, req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email }, include: withProfiles });

    // Always verify a hash, even for unknown emails, so timing does not reveal which emails exist.
    const valid = await verifyPassword(user?.passwordHash ?? (await getDummyHash()), input.password);
    if (!user || !valid) {
      throw new HttpError(401, 'invalid_credentials', 'Email or password is incorrect.');
    }
    if (input.expectedRole && user.role !== input.expectedRole) {
      throw new HttpError(403, 'role_mismatch', `This account is not registered as a ${input.expectedRole}.`);
    }
    res.json(await startSession(deps, res, user));
  });

  // Uses the httpOnly refresh cookie, so the web app can restore a session after a page reload.
  router.post('/refresh', async (req, res) => {
    res.json(await rotateSession(deps, req, res));
  });

  router.post('/logout', async (req, res) => {
    await endSession(deps, req, res);
    res.status(204).end();
  });

  router.get('/me', requireAuth(tokens), async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: caller(req).userId }, include: withProfiles });
    if (!user) throw new HttpError(401, 'unauthorized', 'Sign in to continue.');
    res.json({ user: userDto(user) });
  });

  return router;
}
