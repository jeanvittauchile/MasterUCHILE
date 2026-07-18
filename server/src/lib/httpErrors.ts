export class AppError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) => new AppError(400, message, details);
export const unauthorized = (message = 'No autenticado') => new AppError(401, message);
export const forbidden = (message = 'No autorizado para esta acción') => new AppError(403, message);
export const notFound = (message = 'No encontrado') => new AppError(404, message);
export const conflict = (message: string) => new AppError(409, message);
export const tooManyRequests = (message: string, details?: unknown) => new AppError(429, message, details);
