import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { doctorSummaryDto, withProfiles } from '../dto.js';
import type { ModuleDeps } from '../types.js';

export function doctorsRouter({ prisma, tokens }: ModuleDeps): Router {
  const router = Router();

  // Patients pick a doctor from this list when booking. Contact details are not included.
  router.get('/', requireAuth(tokens), async (_req, res) => {
    const doctors = await prisma.user.findMany({
      where: { role: 'doctor', doctorProfile: { isNot: null } },
      include: withProfiles,
      orderBy: [{ doctorProfile: { firstName: 'asc' } }, { doctorProfile: { lastName: 'asc' } }],
    });
    res.json({ doctors: doctors.map(doctorSummaryDto) });
  });

  return router;
}
