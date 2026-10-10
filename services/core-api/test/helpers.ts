import { loadEnv } from '../src/config/env.js';
import { createPrisma, type PrismaClient } from '../src/lib/prisma.js';

export function createTestPrisma(): PrismaClient {
  return createPrisma(loadEnv().DATABASE_URL); // in NODE_ENV=test this is the test database
}

// Empties every table (and only the test database: loadEnv refuses anything else).
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE prescription_items, prescriptions, prescription_uploads, medical_history,
       appointments, patient_profiles, doctor_profiles, users RESTART IDENTITY CASCADE`,
  );
}

let counter = 0;
export function makeUser(prisma: PrismaClient, role: 'patient' | 'doctor', email?: string) {
  counter += 1;
  return prisma.user.create({
    data: { email: email ?? `${role}${counter}@example.com`, passwordHash: 'not-a-real-hash', role },
  });
}
