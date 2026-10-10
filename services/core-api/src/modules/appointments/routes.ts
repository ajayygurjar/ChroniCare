import { Router } from 'express';
import { z } from 'zod';
import type { AppointmentStatus } from '../../generated/prisma/enums.js';
import { isUniqueViolation } from '../../lib/prisma-errors.js';
import { caller, requireAuth, requireRole } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/errors.js';
import { idParam, parse } from '../../middleware/validate.js';
import { appointmentDto, appointmentInclude } from '../dto.js';
import type { ModuleDeps } from '../types.js';

const createSchema = z.object({
  doctorId: z.uuid({ message: 'must be a valid id' }),
  // An exact moment (ISO 8601 with a timezone). The web app converts the patient's local date and time.
  scheduledAt: z.iso
    .datetime({ offset: true, message: 'must be an ISO date and time, e.g. 2026-10-14T10:30:00+05:30' })
    .transform((value) => new Date(value)),
  reason: z.string().trim().min(1, 'is required').max(500, 'is too long'),
});

const statusSchema = z.object({ status: z.enum(['confirmed', 'cancelled', 'completed']) });

// What a doctor may do next with an appointment.
const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending_payment: ['cancelled'],
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function appointmentsRouter({ prisma, tokens }: ModuleDeps): Router {
  const router = Router();
  router.use(requireAuth(tokens));

  // Your own appointments: as the patient or as the doctor. Nobody else's.
  router.get('/', requireRole('patient', 'doctor'), async (req, res) => {
    const { userId, role } = caller(req);
    const appointments = await prisma.appointment.findMany({
      where: role === 'doctor' ? { doctorId: userId } : { patientId: userId },
      include: appointmentInclude,
      orderBy: { scheduledAt: 'asc' },
    });
    res.json({ appointments: appointments.map(appointmentDto) });
  });

  router.post('/', requireRole('patient'), async (req, res) => {
    const input = parse(createSchema, req.body);
    if (input.scheduledAt.getTime() <= Date.now()) {
      throw new HttpError(400, 'validation_error', 'scheduledAt: must be in the future');
    }
    const doctor = await prisma.user.findFirst({ where: { id: input.doctorId, role: 'doctor' }, select: { id: true } });
    if (!doctor) throw new HttpError(404, 'doctor_not_found', 'That doctor does not exist.');

    try {
      const appointment = await prisma.appointment.create({
        data: {
          patientId: caller(req).userId,
          doctorId: doctor.id,
          scheduledAt: input.scheduledAt,
          reason: input.reason,
        },
        include: appointmentInclude,
      });
      res.status(201).json({ appointment: appointmentDto(appointment) });
    } catch (err) {
      // The partial unique index (doctor, time) for pending/confirmed appointments.
      if (isUniqueViolation(err)) {
        throw new HttpError(409, 'slot_taken', 'That time is already booked with this doctor. Please choose another.');
      }
      throw err;
    }
  });

  // The doctor decides: confirm, decline/cancel, or mark completed.
  router.patch('/:id/status', requireRole('doctor'), async (req, res) => {
    const { id } = parse(idParam, req.params);
    const { status } = parse(statusSchema, req.body);

    const current = await prisma.appointment.findFirst({ where: { id, doctorId: caller(req).userId } });
    if (!current) throw new HttpError(404, 'not_found', 'Appointment not found.');
    if (!TRANSITIONS[current.status].includes(status)) {
      throw new HttpError(409, 'invalid_transition', `A ${current.status} appointment cannot be changed to ${status}.`);
    }

    const appointment = await prisma.appointment.update({ where: { id }, data: { status }, include: appointmentInclude });
    res.json({ appointment: appointmentDto(appointment) });
  });

  return router;
}
