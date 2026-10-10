import { Router } from 'express';
import { caller, requireAuth, requireRole } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/errors.js';
import { idParam, parse } from '../../middleware/validate.js';
import { assertCanViewPatient } from '../access.js';
import { historyDto, historyInclude, userDto, withProfiles } from '../dto.js';
import type { ModuleDeps } from '../types.js';

export function patientsRouter({ prisma, tokens }: ModuleDeps): Router {
  const router = Router();
  router.use(requireAuth(tokens));

  // A doctor's patients: those with a non-cancelled appointment with that doctor. Not every patient.
  router.get('/', requireRole('doctor'), async (req, res) => {
    const patients = await prisma.user.findMany({
      where: {
        role: 'patient',
        appointmentsAsPatient: { some: { doctorId: caller(req).userId, status: { not: 'cancelled' } } },
      },
      include: withProfiles,
      orderBy: [{ patientProfile: { firstName: 'asc' } }, { patientProfile: { lastName: 'asc' } }],
    });
    res.json({ patients: patients.map(userDto) });
  });

  router.get('/:id', async (req, res) => {
    const { id } = parse(idParam, req.params);
    await assertCanViewPatient(prisma, caller(req), id);
    const patient = await prisma.user.findFirst({ where: { id, role: 'patient' }, include: withProfiles });
    if (!patient) throw new HttpError(404, 'not_found', 'Patient not found.');
    res.json({ patient: userDto(patient) });
  });

  router.get('/:id/history', async (req, res) => {
    const { id } = parse(idParam, req.params);
    await assertCanViewPatient(prisma, caller(req), id);
    const records = await prisma.medicalHistory.findMany({
      where: { patientId: id },
      include: historyInclude,
      orderBy: { recordedAt: 'desc' },
    });
    res.json({ records: records.map(historyDto) });
  });

  return router;
}
