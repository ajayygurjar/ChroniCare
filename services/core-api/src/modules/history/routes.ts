import { Router } from 'express';
import { z } from 'zod';
import { isUniqueViolation } from '../../lib/prisma-errors.js';
import { caller, requireAuth, requireRole } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/errors.js';
import { idParam, parse } from '../../middleware/validate.js';
import { assertCanViewPatient } from '../access.js';
import { historyDto, historyInclude } from '../dto.js';
import type { ModuleDeps } from '../types.js';

const recordSchema = z.object({
  diagnosis: z.string().trim().min(1, 'is required').max(200, 'is too long'),
  notes: z.string().trim().max(5000, 'is too long').default(''),
});

const prescriptionSchema = z.object({
  drug: z.string().trim().min(1, 'is required').max(120, 'is too long'),
  time: z.string().trim().max(80, 'is too long').default(''),
  meal: z.enum(['before', 'after', 'with', 'any']).default('after'),
});

export function historyRouter({ prisma, tokens }: ModuleDeps): Router {
  const router = Router();
  router.use(requireAuth(tokens));

  // Patients keep their own medical history. (Reading it: GET /api/patients/:id/history.)
  router.post('/', requireRole('patient'), async (req, res) => {
    const input = parse(recordSchema, req.body);
    const { userId } = caller(req);
    const record = await prisma.medicalHistory.create({
      data: { patientId: userId, createdBy: userId, diagnosis: input.diagnosis, notes: input.notes || null },
      include: historyInclude,
    });
    res.status(201).json({ record: historyDto(record) });
  });

  // A doctor writes the prescription for a record of one of their patients.
  router.post('/:id/prescription', requireRole('doctor'), async (req, res) => {
    const { id } = parse(idParam, req.params);
    const input = parse(prescriptionSchema, req.body);
    const doctor = caller(req);

    const record = await prisma.medicalHistory.findUnique({ where: { id }, select: { id: true, patientId: true } });
    if (!record) throw new HttpError(404, 'not_found', 'Record not found.');
    await assertCanViewPatient(prisma, doctor, record.patientId);

    try {
      await prisma.prescription.create({
        data: {
          patientId: record.patientId,
          doctorId: doctor.userId,
          source: 'doctor',
          medicalHistoryId: record.id,
          issuedAt: new Date(),
          items: { create: [{ drugName: input.drug, timing: input.time || null, mealRelation: input.meal }] },
        },
      });
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new HttpError(409, 'prescription_exists', 'This record already has a prescription.');
      }
      throw err;
    }

    const updated = await prisma.medicalHistory.findUniqueOrThrow({ where: { id }, include: historyInclude });
    res.status(201).json({ record: historyDto(updated) });
  });

  return router;
}
