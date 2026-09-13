export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function badRequest(msg: string, details?: unknown) {
  return new ApiError(400, msg, details);
}

export function unauthorized(msg = 'No autenticado') {
  return new ApiError(401, msg);
}

export function forbidden(msg = 'Sin permisos para esta acción') {
  return new ApiError(403, msg);
}

export function notFound(msg = 'Recurso no encontrado') {
  return new ApiError(404, msg);
}

export function conflict(msg: string) {
  return new ApiError(409, msg);
}

export function internal(msg = 'Error interno del servidor') {
  return new ApiError(500, msg);
}

/** Formatea respuesta exitosa */
export function ok(data: unknown, status = 200) {
  return Response.json({ data, error: null }, { status });
}

/** Formatea respuesta de error */
export function err(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      { data: null, error: { message: error.message, details: error.details } },
      { status: error.status }
    );
  }
  console.error('[API Error]', error);
  return Response.json(
    { data: null, error: { message: 'Error interno del servidor' } },
    { status: 500 }
  );
}
