// Demo data for LOCAL DEVELOPMENT:  npm run db:seed
// Creates a few accounts (all with the same demo password) plus appointments, medical records and
// prescriptions, so the app is not empty on first run. Safe to run twice; refuses to run in production.
import { loadEnv } from '../src/config/env.js';
import { hashPassword } from '../src/lib/password.js';
import { createPrisma } from '../src/lib/prisma.js';

const DEMO_PASSWORD = 'Demo-password-1';

const env = process.env.NODE_ENV === 'production' ? null : loadEnv();
if (!env) {
  console.error('Refusing to seed demo accounts in production.');
  process.exit(1);
}
const prisma = createPrisma(env.DATABASE_URL);

const day = 24 * 60 * 60 * 1000;
/** A moment `days` from now (negative = past) at the given UTC time. */
const at = (days: number, hour: number, minute = 0) => {
  const d = new Date(Date.now() + days * day);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
};
const daysAgo = (n: number) => new Date(Date.now() - n * day);

async function main() {
  if (await prisma.user.findUnique({ where: { email: 'demo.doctor@example.com' } })) {
    console.log('Demo data is already there. Nothing to do.');
    return;
  }
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const doctor = (email: string, firstName: string, lastName: string, specialization: string, experienceYears: number, address: string) =>
    prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'doctor',
        doctorProfile: {
          create: { firstName, lastName, specialization, experienceYears, address, gender: 'Other', phone: '98200 11223', dateOfBirth: new Date('1980-01-15') },
        },
      },
    });
  const patient = (email: string, firstName: string, lastName: string, gender: string, dateOfBirth: string, address: string) =>
    prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'patient',
        patientProfile: { create: { firstName, lastName, gender, dateOfBirth: new Date(dateOfBirth), phone: '98765 43210', address } },
      },
    });

  const rao = await doctor('demo.doctor@example.com', 'Rohan', 'Rao', 'Cardiologist', 12, 'Baner, Pune');
  const iyer = await doctor('meera.iyer@example.com', 'Meera', 'Iyer', 'Endocrinologist', 9, 'Kothrud, Pune');
  const asha = await patient('demo.patient@example.com', 'Asha', 'Kapoor', 'Female', '1992-04-25', 'Pune, MH');
  const vikram = await patient('vikram.joshi@example.com', 'Vikram', 'Joshi', 'Male', '1974-09-02', 'Pune');

  await prisma.appointment.createMany({
    data: [
      { patientId: asha.id, doctorId: rao.id, scheduledAt: at(3, 5, 0), reason: 'Blood pressure review', status: 'confirmed' },
      { patientId: asha.id, doctorId: iyer.id, scheduledAt: at(6, 4, 0), reason: 'Diabetes check', status: 'pending' },
      { patientId: asha.id, doctorId: rao.id, scheduledAt: at(-20, 5, 30), reason: 'Follow-up', status: 'completed' },
      { patientId: vikram.id, doctorId: rao.id, scheduledAt: at(4, 6, 0), reason: 'Chest discomfort', status: 'pending' },
    ],
  });

  const record = (patientId: string, diagnosis: string, notes: string, recordedAt: Date) =>
    prisma.medicalHistory.create({ data: { patientId, createdBy: patientId, diagnosis, notes, recordedAt } });
  const prescribe = (patientId: string, doctorId: string, medicalHistoryId: string, drugName: string, timing: string) =>
    prisma.prescription.create({
      data: {
        patientId,
        doctorId,
        source: 'doctor',
        medicalHistoryId,
        issuedAt: new Date(),
        items: { create: [{ drugName, timing, mealRelation: 'after' }] },
      },
    });

  const hypertension = await record(asha.id, 'Hypertension (Stage 1)', 'BP 142/92 at clinic. Reduce salt, daily walk.', daysAgo(8));
  await prescribe(asha.id, rao.id, hypertension.id, 'Amlodipine 5 mg', 'Morning');
  const diabetes = await record(asha.id, 'Type 2 diabetes', 'HbA1c 7.4%. Continue diet plan.', daysAgo(53));
  await prescribe(asha.id, iyer.id, diabetes.id, 'Metformin 500 mg', 'Evening');
  await record(asha.id, 'Seasonal allergy', 'Antihistamine as needed.', daysAgo(152));
  await record(vikram.id, 'Angina', 'Stress test advised.', daysAgo(12));

  console.log(`Demo data created. Sign in with any of these (password: ${DEMO_PASSWORD}):`);
  console.log('  patient  demo.patient@example.com   (Asha Kapoor)');
  console.log('  doctor   demo.doctor@example.com    (Dr. Rohan Rao)');
  console.log('  patient  vikram.joshi@example.com   doctor  meera.iyer@example.com');
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
