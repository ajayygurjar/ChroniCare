// Prisma reports database constraint failures with stable error codes.
function hasCode(err: unknown, code: string): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === code;
}

/** A unique index or constraint rejected the write (P2002). */
export const isUniqueViolation = (err: unknown): boolean => hasCode(err, 'P2002');
