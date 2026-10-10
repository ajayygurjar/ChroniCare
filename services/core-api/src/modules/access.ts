import type { PrismaClient } from '../lib/prisma.js';
import { HttpError } from '../middleware/errors.js';
import type { Role } from '../generated/prisma/enums.js';

// Who may see a patient's data (architecture plan, section 13):
//  - a patient: only their own;
//  - a doctor: only patients they have a (non-cancelled) appointment with;
//  - nobody else, including other patients and admins.
export async function assertCanViewPatient(
  prisma: PrismaClient,
  caller: { userId: string; role: Role },
  patientId: string,
): Promise<void> {
  if (caller.role === 'patient' && caller.userId === patientId) return;

  if (caller.role === 'doctor') {
    const relationship = await prisma.appointment.findFirst({
      where: { patientId, doctorId: caller.userId, status: { not: 'cancelled' } },
      select: { id: true },
    });
    if (relationship) return;
  }

  throw new HttpError(403, 'forbidden', 'You do not have access to this patient.');
}
