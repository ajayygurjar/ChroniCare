import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { PrismaClient } from '../src/lib/prisma.js';
import { bearer, book, buildApp, createTestPrisma, inDays, register, resetDatabase, setStatus, type Account } from './helpers.js';

let prisma: PrismaClient;
let app: Awaited<ReturnType<typeof buildApp>>['app'];

beforeAll(async () => {
  prisma = createTestPrisma();
  ({ app } = await buildApp(prisma));
});
beforeEach(() => resetDatabase(prisma));
afterAll(() => prisma.$disconnect());

const addRecord = (patient: Account, diagnosis = 'Hypertension (Stage 1)', notes = 'BP 142/92. Reduce salt.') =>
  request(app).post('/api/history').set(bearer(patient.token)).send({ diagnosis, notes });

const prescribe = (doctor: Account, recordId: string, body: Record<string, unknown> = { drug: 'Amlodipine 5 mg', time: 'Morning', meal: 'after' }) =>
  request(app).post(`/api/history/${recordId}/prescription`).set(bearer(doctor.token)).send(body);

describe('every protected route needs a signed-in user', () => {
  it.each([
    ['get', '/api/auth/me'],
    ['get', '/api/doctors'],
    ['get', '/api/patients'],
    ['get', '/api/patients/00000000-0000-4000-8000-000000000000'],
    ['get', '/api/patients/00000000-0000-4000-8000-000000000000/history'],
    ['get', '/api/appointments'],
    ['post', '/api/appointments'],
    ['patch', '/api/appointments/00000000-0000-4000-8000-000000000000/status'],
    ['post', '/api/history'],
    ['post', '/api/history/00000000-0000-4000-8000-000000000000/prescription'],
  ] as const)('%s %s -> 401', async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });
});

describe("a doctor's patients", () => {
  it('lists only patients who have an appointment with that doctor', async () => {
    const [mine, theirs, stranger] = [await register(app, 'patient'), await register(app, 'patient'), await register(app, 'patient')];
    const [doctor, otherDoctor] = [await register(app, 'doctor'), await register(app, 'doctor')];
    await book(app, mine, doctor.id, inDays(3));
    await book(app, theirs, otherDoctor.id, inDays(3));
    void stranger;

    const res = await request(app).get('/api/patients').set(bearer(doctor.token));
    expect(res.status).toBe(200);
    expect(res.body.patients.map((p: { id: string }) => p.id)).toEqual([mine.id]);
  });

  it('drops a patient whose only appointment was declined', async () => {
    const [patient, doctor] = [await register(app, 'patient'), await register(app, 'doctor')];
    const id = (await book(app, patient, doctor.id, inDays(3))).body.appointment.id;
    await setStatus(app, doctor, id, 'cancelled');

    const res = await request(app).get('/api/patients').set(bearer(doctor.token));
    expect(res.body.patients).toEqual([]);
  });

  it('is not available to patients', async () => {
    const patient = await register(app, 'patient');
    expect((await request(app).get('/api/patients').set(bearer(patient.token))).status).toBe(403);
  });
});

describe('who may read a patient', () => {
  it('lets a patient read themselves, and nobody else', async () => {
    const [a, b] = [await register(app, 'patient'), await register(app, 'patient')];
    const self = await request(app).get(`/api/patients/${a.id}`).set(bearer(a.token));
    expect(self.status).toBe(200);
    expect(self.body.patient).toMatchObject({ id: a.id, email: a.email, role: 'patient' });

    const other = await request(app).get(`/api/patients/${b.id}`).set(bearer(a.token));
    expect(other.status).toBe(403);
    expect((await request(app).get(`/api/patients/${b.id}/history`).set(bearer(a.token))).status).toBe(403);
  });

  it('lets a doctor read a patient only once they have an appointment together', async () => {
    const [patient, doctor] = [await register(app, 'patient'), await register(app, 'doctor')];
    expect((await request(app).get(`/api/patients/${patient.id}`).set(bearer(doctor.token))).status).toBe(403);

    await book(app, patient, doctor.id, inDays(3));
    expect((await request(app).get(`/api/patients/${patient.id}`).set(bearer(doctor.token))).status).toBe(200);
    expect((await request(app).get(`/api/patients/${patient.id}/history`).set(bearer(doctor.token))).status).toBe(200);
  });

  it('keeps one doctor out of another doctor\'s patient', async () => {
    const [patient, doctor, other] = [await register(app, 'patient'), await register(app, 'doctor'), await register(app, 'doctor')];
    await book(app, patient, doctor.id, inDays(3));
    expect((await request(app).get(`/api/patients/${patient.id}`).set(bearer(other.token))).status).toBe(403);
  });

  it('rejects a malformed id with 400, not a server error', async () => {
    const patient = await register(app, 'patient');
    expect((await request(app).get('/api/patients/not-a-uuid').set(bearer(patient.token))).status).toBe(400);
  });
});

describe('medical history', () => {
  it('lets a patient add records and read them newest first', async () => {
    const patient = await register(app, 'patient');
    expect((await addRecord(patient, 'Seasonal allergy', 'Antihistamine as needed.')).status).toBe(201);
    await prisma.medicalHistory.updateMany({ data: { recordedAt: new Date(Date.now() - 86_400_000) } });
    expect((await addRecord(patient, 'Migraine', 'Hydrate.')).status).toBe(201);

    const res = await request(app).get(`/api/patients/${patient.id}/history`).set(bearer(patient.token));
    expect(res.body.records.map((r: { diagnosis: string }) => r.diagnosis)).toEqual(['Migraine', 'Seasonal allergy']);
    expect(res.body.records[0]).toMatchObject({ patientId: patient.id, notes: 'Hydrate.', prescription: null });
  });

  it('validates input and is for patients only', async () => {
    const [patient, doctor] = [await register(app, 'patient'), await register(app, 'doctor')];
    expect((await addRecord(patient, '', 'x')).status).toBe(400);
    expect((await request(app).post('/api/history').set(bearer(doctor.token)).send({ diagnosis: 'x', notes: 'y' })).status).toBe(403);
  });

  it("never shows one patient's records to another patient", async () => {
    const [a, b] = [await register(app, 'patient'), await register(app, 'patient')];
    await addRecord(a, 'Private diagnosis');
    const res = await request(app).get(`/api/patients/${a.id}/history`).set(bearer(b.token));
    expect(res.status).toBe(403);
    expect(JSON.stringify(res.body)).not.toContain('Private diagnosis');
  });
});

describe('prescriptions', () => {
  async function setup() {
    const [patient, doctor] = [await register(app, 'patient'), await register(app, 'doctor', { address: 'Baner, Pune' })];
    await book(app, patient, doctor.id, inDays(3));
    const recordId = (await addRecord(patient)).body.record.id as string;
    return { patient, doctor, recordId };
  }

  it("lets the patient's doctor prescribe, and the patient sees who prescribed it", async () => {
    const { patient, doctor, recordId } = await setup();
    const res = await prescribe(doctor, recordId);

    expect(res.status).toBe(201);
    expect(res.body.record.prescription).toMatchObject({
      drug: 'Amlodipine 5 mg',
      time: 'Morning',
      meal: 'After Meal',
      mealRelation: 'after',
      prescribedBy: expect.stringMatching(/^Rohan Rao\d+ \(Baner, Pune\)$/),
    });

    const seen = await request(app).get(`/api/patients/${patient.id}/history`).set(bearer(patient.token));
    expect(seen.body.records[0].prescription.drug).toBe('Amlodipine 5 mg');
  });

  it('allows only one prescription per record', async () => {
    const { doctor, recordId } = await setup();
    await prescribe(doctor, recordId).then((r) => expect(r.status).toBe(201));
    const again = await prescribe(doctor, recordId, { drug: 'Something else' });
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe('prescription_exists');
  });

  it('refuses a doctor who has no appointment with the patient', async () => {
    const { recordId } = await setup();
    const stranger = await register(app, 'doctor');
    expect((await prescribe(stranger, recordId)).status).toBe(403);
    expect(await prisma.prescription.count()).toBe(0);
  });

  it('refuses patients, validates input, and handles unknown records', async () => {
    const { patient, doctor, recordId } = await setup();
    const asPatient = await request(app).post(`/api/history/${recordId}/prescription`).set(bearer(patient.token)).send({ drug: 'x' });
    expect(asPatient.status).toBe(403);
    expect((await prescribe(doctor, recordId, { drug: '' })).status).toBe(400);
    expect((await prescribe(doctor, recordId, { drug: 'x', meal: 'whenever' })).status).toBe(400);
    expect((await prescribe(doctor, '00000000-0000-4000-8000-000000000000')).status).toBe(404);
  });

  it('shows the same prescription to the prescribing doctor in the patient view', async () => {
    const { patient, doctor, recordId } = await setup();
    await prescribe(doctor, recordId, { drug: 'Metformin 500 mg', time: 'Evening', meal: 'before' });
    const res = await request(app).get(`/api/patients/${patient.id}/history`).set(bearer(doctor.token));
    expect(res.body.records[0].prescription).toMatchObject({ drug: 'Metformin 500 mg', meal: 'Before Meal' });
  });
});
