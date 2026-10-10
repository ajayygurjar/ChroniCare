import { z } from 'zod';
import { HttpError } from './errors.js';

// Validates untrusted input (body, params) against a zod schema. On failure it answers 400 with a
// readable message (shown to users by the web app) and per-field details.
export function parse<S extends z.ZodType>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const details = result.error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
  const first = details[0];
  throw new HttpError(
    400,
    'validation_error',
    first && first.field !== 'body' ? `${first.field}: ${first.message}` : 'Invalid request.',
    details,
  );
}

export const idParam = z.object({ id: z.uuid({ message: 'must be a valid id' }) });
