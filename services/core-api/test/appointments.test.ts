import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { PrismaClient } from '../src/lib/prisma.js';
import { bearer, book, buildApp, createTestPrisma, inDays, register, resetDatabase, setStatus } from './helpers.js';

let prisma: PrismaClient;
let app: Awaited<ReturnType<typeof buildApp>>['app'];

beforeAll(async () => {
  prisma = createTestPrisma();
  ({ app } = await buildApp(prisma));
});
beforeEach(() => resetDatabase(prisma));
afterAll(() => prisma.$disconnect());

describe('GET /api/doctors', () => {
  it('lists doctors without contact details, for any signed-in user', async () => {
    const patient = await register(app, 'patient');
    await register(app, 'doctor', { speciality: 'Cardiologist', experience: 12 });
    await register(app, 'patient'); // patients are not listed

    const res = await request(app).get('/api/doctors').set(bearer(patient.token));
    expect(res.status).toBe(200);
    expect(res.body.doctors).toHaveLength(1);
    expect(res.body.doctors[0]).toMatchObject({ firstName: 'Rohan', speciality: 'Cardiologist', experience: 12 });
    expect(res.body.doctors[0]).not.toHaveProperty('email');
    expect(res.body.doctors[0]).not.toHaveProperty('phone');
    expect(res.body.doctors[0]).not.toHaveProperty('address');
  });

  it('needs a signed-in user', async () => {
    expect((await request(app).get('/api/doctors')).status).toBe(401);
  });
});

describe('POST /api/appointments', () => {
  it('lets a patient request an appointment, which starts as pending', async () => {
    const [patient, doctor] = [await register(app, 'patient'), await register(app, 'doctor')];
    const res = await book(app, patient, doctor.id, inDays(3), 'Blood pressure review');

    expect(res.status).toBe(201);
    expect(res.body.appointment).toMatchObject({
      patientId: patient.id,
      doctorId: doctor.id,
      status: 'pending',
      reason: 'Blood pressure review',
      scheduledAt: inDays(3).toISOString(),
    });
    expect(res.body.appointment.patientName).toMatch(/^Asha /);
    expect(res.body.appointment.doctorName).toMatch(/^Rohan /);
  });

  it('refuses a second active booking of the same doctor and time with 409', async () => {
    const [p1, p2, doctor] = [await register(app, 'patient'), await register(app, 'patient'), await register(app, 'doctor')];
    await book(app, p1, doctor.id, inDays(3)).then((r) => expect(r.status).toBe(201));

    const clash = await book(app, p2, doctor.id, inDays(3));
    expect(clash.status).toBe(409);
    expect(clash.body.error.code).toBe('slot_taken');
  });

  it('frees the slot when the doctor declines', async () => {
    const [p1, p2, doctor] = [await register(app, 'patient'), await register(app, 'patient'), await register(app, 'doctor')];
    const first = await book(app, p1, doctor.id, inDays(3));
    await setStatus(app, doctor, first.body.appointment.id, 'cancelled').then((r) => expect(r.status).toBe(200));

    expect((await book(app, p2, doctor.id, inDays(3))).status).toBe(201);
  });

  it('lets two different doctors be booked for the same time', async () => {
    const [patient, d1, d2] = [await register(app, 'patient'), await register(app, 'doctor'), await register(app, 'doctor')];
    expect((await book(app, patient, d1.id, inDays(3))).status).toBe(201);
    expect((await book(app, patient, d2.id, inDays(3))).status).toBe(201);
  });

  it('rejects times in the past', async () => {
    const [patient, doctor] = [await register(app, 'patient'), await register(app, 'doctor')];
    const res = await book(app, patient, doctor.id, inDays(-1));
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/future/);
  });

  it('rejects an unknown doctor, a patient id used as a doctor, and invalid input', async () => {
    const [patient, other] = [await register(app, 'patient'), await register(app, 'patient')];
    expect((await book(app, patient, '00000000-0000-4000-8000-000000000000', inDays(3))).status).toBe(404);
    expect((await book(app, patient, other.id, inDays(3))).status).toBe(404);

    const doctor = await register(app, 'doctor');
    const noReason = await request(app).post('/api/appointments').set(bearer(patient.token)).send({ doctorId: doctor.id, scheduledAt: inDays(3).toISOString(), reason: '' });
    expect(noReason.status).toBe(400);
    const badDate = await request(app).post('/api/appointments').set(bearer(patient.token)).send({ doctorId: doctor.id, scheduledAt: 'tomorrow', reason: 'x' });
    expect(badDate.status).toBe(400);
  });

  it('is for patients only', async () => {
    const doctor = await register(app, 'doctor');
    const res = await request(app).post('/api/appointments').set(bearer(doctor.token)).send({ doctorId: doctor.id, scheduledAt: inDays(3).toISOString(), reason: 'x' });
    expect(res.status).toBe(403);
    expect((await request(app).post('/api/appointments').send({})).status).toBe(401);
  });
});

describe('GET /api/appointments', () => {
  it('shows each person only their own appointments, soonest first', async () => {
    const [p1, p2, d1, d2] = [await register(app, 'patient'), await register(app, 'patient'), await register(app, 'doctor'), await register(app, 'doctor')];
    await book(app, p1, d1.id, inDays(5));
    await book(app, p1, d2.id, inDays(2));
    await book(app, p2, d1.id, inDays(7));

    const mine = await request(app).get('/api/appointments').set(bearer(p1.token));
    expect(mine.body.appointments.map((a: { scheduledAt: string }) => a.scheduledAt)).toEqual([inDays(2).toISOString(), inDays(5).toISOString()]);

    const doctorView = await request(app).get('/api/appointments').set(bearer(d1.token));
    expect(doctorView.body.appointments).toHaveLength(2); // p1's and p2's requests to d1, not the one to d2

    const other = await request(app).get('/api/appointments').set(bearer(d2.token));
    expect(other.body.appointments).toHaveLength(1);
  });
});

describe('PATCH /api/appointments/:id/status', () => {
  it('lets the doctor confirm and then complete', async () => {
    const [patient, doctor] = [await register(app, 'patient'), await register(app, 'doctor')];
    const { body } = await book(app, patient, doctor.id, inDays(3));
    const id = body.appointment.id;

    const confirmed = await setStatus(app, doctor, id, 'confirmed');
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.appointment.status).toBe('confirmed');

    const done = await setStatus(app, doctor, id, 'completed');
    expect(done.body.appointment.status).toBe('completed');
  });

  it('enforces the allowed transitions', async () => {
    const [patient, doctor] = [await register(app, 'patient'), await register(app, 'doctor')];
    const id = (await book(app, patient, doctor.id, inDays(3))).body.appointment.id;

    const skip = await setStatus(app, doctor, id, 'completed'); // pending -> completed
    expect(skip.status).toBe(409);
    expect(skip.body.error.code).toBe('invalid_transition');

    await setStatus(app, doctor, id, 'cancelled');
    expect((await setStatus(app, doctor, id, 'confirmed')).status).toBe(409); // cancelled is final
  });

  it('only the appointment\'s own doctor may change it', async () => {
    const [patient, owner, other] = [await register(app, 'patient'), await register(app, 'doctor'), await register(app, 'doctor')];
    const id = (await book(app, patient, owner.id, inDays(3))).body.appointment.id;

    expect((await setStatus(app, other, id, 'confirmed')).status).toBe(404); // not revealed to other doctors
    const asPatient = await request(app).patch(`/api/appointments/${id}/status`).set(bearer(patient.token)).send({ status: 'confirmed' });
    expect(asPatient.status).toBe(403);
    const bad = await request(app).patch(`/api/appointments/${id}/status`).set(bearer(owner.token)).send({ status: 'pending' });
    expect(bad.status).toBe(400);
    const notAnId = await request(app).patch('/api/appointments/abc/status').set(bearer(owner.token)).send({ status: 'confirmed' });
    expect(notAnId.status).toBe(400);
  });
});
