import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { PrismaClient } from '../src/lib/prisma.js';
import { createTestPrisma, makeUser, resetDatabase } from './helpers.js';

// These tests run against a real PostgreSQL (the test database) because the rules they check
// live in the database itself: the partial unique index, citext, and foreign keys.
let prisma: PrismaClient;

beforeEach(async () => {
  prisma ??= createTestPrisma();
  await resetDatabase(prisma);
});

afterAll(async () => {
  await prisma?.$disconnect();
});

const slot = new Date('2027-03-01T09:30:00.000Z');

describe('users', () => {
  it('treats emails as case-insensitive', async () => {
    await makeUser(prisma, 'patient', 'Asha@Example.com');
    await expect(makeUser(prisma, 'patient', 'asha@example.COM')).rejects.toMatchObject({ code: 'P2002' });
  });

  it('generates UUID ids in the database', async () => {
    const user = await makeUser(prisma, 'patient');
    expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});

describe('appointments: no double booking', () => {
  it('rejects a second active appointment for the same doctor and time', async () => {
    const doctor = await makeUser(prisma, 'doctor');
    const [a, b] = [await makeUser(prisma, 'patient'), await makeUser(prisma, 'patient')];

    await prisma.appointment.create({ data: { patientId: a.id, doctorId: doctor.id, scheduledAt: slot } });
    await expect(
      prisma.appointment.create({ data: { patientId: b.id, doctorId: doctor.id, scheduledAt: slot, status: 'confirmed' } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('frees the slot once the earlier appointment is cancelled', async () => {
    const doctor = await makeUser(prisma, 'doctor');
    const [a, b] = [await makeUser(prisma, 'patient'), await makeUser(prisma, 'patient')];

    const first = await prisma.appointment.create({ data: { patientId: a.id, doctorId: doctor.id, scheduledAt: slot } });
    await prisma.appointment.update({ where: { id: first.id }, data: { status: 'cancelled' } });

    await expect(
      prisma.appointment.create({ data: { patientId: b.id, doctorId: doctor.id, scheduledAt: slot } }),
    ).resolves.toMatchObject({ status: 'pending' });
  });

  it('lets two different doctors hold the same time', async () => {
    const [d1, d2] = [await makeUser(prisma, 'doctor'), await makeUser(prisma, 'doctor')];
    const patient = await makeUser(prisma, 'patient');

    await prisma.appointment.create({ data: { patientId: patient.id, doctorId: d1.id, scheduledAt: slot } });
    await expect(
      prisma.appointment.create({ data: { patientId: patient.id, doctorId: d2.id, scheduledAt: slot } }),
    ).resolves.toBeDefined();
  });
});

describe('referential integrity', () => {
  it('refuses to delete a patient who has medical history', async () => {
    const [patient, doctor] = [await makeUser(prisma, 'patient'), await makeUser(prisma, 'doctor')];
    await prisma.medicalHistory.create({
      data: { patientId: patient.id, createdBy: doctor.id, diagnosis: 'Hypertension (Stage 1)' },
    });
    await expect(prisma.user.delete({ where: { id: patient.id } })).rejects.toMatchObject({ code: 'P2003' });
  });

  it('deletes a prescription together with its items, with sensible defaults', async () => {
    const [patient, doctor] = [await makeUser(prisma, 'patient'), await makeUser(prisma, 'doctor')];
    const prescription = await prisma.prescription.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        source: 'doctor',
        items: { create: [{ drugName: 'Amlodipine', strength: '5 mg', frequency: 'once daily' }] },
      },
      include: { items: true },
    });
    expect(prescription.items[0]?.mealRelation).toBe('any');

    await prisma.prescription.delete({ where: { id: prescription.id } });
    expect(await prisma.prescriptionItem.count()).toBe(0);
  });

  it('stores structured OCR output as JSON with a bounded confidence', async () => {
    const patient = await makeUser(prisma, 'patient');
    const upload = await prisma.prescriptionUpload.create({
      data: {
        patientId: patient.id,
        objectKey: `uploads/${patient.id}/abc`,
        mimeType: 'image/jpeg',
        sizeBytes: 123_456,
        extracted: { items: [{ drug: 'Paracetamol', strength: '650 mg' }] },
        confidence: 0.873,
      },
    });
    expect(upload.status).toBe('queued');
    expect(upload.extracted).toEqual({ items: [{ drug: 'Paracetamol', strength: '650 mg' }] });
    expect(upload.confidence?.toString()).toBe('0.873');
  });
});
