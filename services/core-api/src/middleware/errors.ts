import type { ErrorRequestHandler, RequestHandler } from 'express';

// Throw this from route handlers to send a specific status and a stable machine-readable code.
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

const CODE_BY_STATUS: Record<number, string> = {
  400: 'bad_request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  413: 'payload_too_large',
  422: 'unprocessable_entity',
  429: 'too_many_requests',
};

export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, 'not_found', `No route for ${req.method} ${req.path}`));
};

// One error shape for every failure: { error: { code, message, requestId, details? } }.
// Server errors never leak their message or stack to the client; they are logged with the request id.
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status =
    err instanceof HttpError
      ? err.status
      : typeof err?.status === 'number' && err.status >= 400 && err.status < 600
        ? err.status // e.g. malformed JSON from the body parser
        : 500;

  if (status >= 500) {
    req.log.error({ err }, 'unhandled error');
  }

  res.status(status).json({
    error: {
      code: err instanceof HttpError ? err.code : (CODE_BY_STATUS[status] ?? (status >= 500 ? 'internal_error' : 'error')),
      message: status >= 500 ? 'Internal server error' : err instanceof Error ? err.message : 'Request failed',
      requestId: req.id,
      ...(err instanceof HttpError && err.details !== undefined ? { details: err.details } : {}),
    },
  });
};
