import type { Prisma } from '../generated/prisma/client.js';
import type { MealRelation } from '../generated/prisma/enums.js';

// What the API sends to clients. Mapping lives here so database columns can change
// without changing the API (and the web app) with them.

export const withProfiles = { patientProfile: true, doctorProfile: true } as const satisfies Prisma.UserInclude;
export type UserWithProfiles = Prisma.UserGetPayload<{ include: typeof withProfiles }>;

export const appointmentInclude = {
  patient: { include: withProfiles },
  doctor: { include: withProfiles },
} as const satisfies Prisma.AppointmentInclude;
export type AppointmentWithPeople = Prisma.AppointmentGetPayload<{ include: typeof appointmentInclude }>;

export const historyInclude = {
  prescription: { include: { items: true, doctor: { include: withProfiles } } },
} as const satisfies Prisma.MedicalHistoryInclude;
export type HistoryWithPrescription = Prisma.MedicalHistoryGetPayload<{ include: typeof historyInclude }>;

const MEAL_LABELS: Record<MealRelation, string> = {
  before: 'Before Meal',
  after: 'After Meal',
  with: 'With Meal',
  any: 'Any time',
};

export function ageFrom(dateOfBirth: Date | null, now: Date = new Date()): number | null {
  if (!dateOfBirth) return null;
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const birthdayPassed =
    now.getUTCMonth() > dateOfBirth.getUTCMonth() ||
    (now.getUTCMonth() === dateOfBirth.getUTCMonth() && now.getUTCDate() >= dateOfBirth.getUTCDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

function personName(user: UserWithProfiles | null): string {
  const profile = user?.role === 'doctor' ? user.doctorProfile : user?.patientProfile;
  return profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
}

// The signed-in user, or a patient as seen by their doctor.
export function userDto(user: UserWithProfiles) {
  const doctor = user.role === 'doctor' ? user.doctorProfile : null;
  const profile = doctor ?? user.patientProfile;
  const dateOfBirth = profile?.dateOfBirth ?? null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    gender: profile?.gender ?? null,
    dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().slice(0, 10) : null,
    age: ageFrom(dateOfBirth),
    phone: profile?.phone ?? null,
    address: profile?.address ?? null,
    ...(doctor
      ? {
          speciality: doctor.specialization,
          experience: doctor.experienceYears,
          consultationFeeMinor: doctor.consultationFeeMinor,
        }
      : {}),
  };
}

// A doctor as shown to patients choosing one: no contact details.
export function doctorSummaryDto(user: UserWithProfiles) {
  const doctor = user.doctorProfile;
  return {
    id: user.id,
    firstName: doctor?.firstName ?? '',
    lastName: doctor?.lastName ?? '',
    speciality: doctor?.specialization ?? '',
    experience: doctor?.experienceYears ?? 0,
    consultationFeeMinor: doctor?.consultationFeeMinor ?? 0,
  };
}

export function appointmentDto(appointment: AppointmentWithPeople) {
  return {
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: personName(appointment.patient),
    doctorId: appointment.doctorId,
    doctorName: personName(appointment.doctor),
    scheduledAt: appointment.scheduledAt.toISOString(),
    reason: appointment.reason ?? '',
    status: appointment.status,
    createdAt: appointment.createdAt.toISOString(),
  };
}

export function historyDto(record: HistoryWithPrescription) {
  const rx = record.prescription;
  const item = rx?.items[0];
  const doctor = rx?.doctor;
  const doctorAddress = doctor?.doctorProfile?.address;
  return {
    id: record.id,
    patientId: record.patientId,
    diagnosis: record.diagnosis,
    notes: record.notes ?? '',
    date: record.recordedAt.toISOString(),
    prescription:
      rx && item
        ? {
            drug: item.drugName,
            time: item.timing ?? '',
            meal: MEAL_LABELS[item.mealRelation],
            mealRelation: item.mealRelation,
            prescribedBy: doctor ? `${personName(doctor)}${doctorAddress ? ` (${doctorAddress})` : ''}` : '',
            addedAt: rx.createdAt.toISOString(),
          }
        : null,
  };
}
