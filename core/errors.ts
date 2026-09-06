export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "AppError";
  }
}

export type AppErrorCode =
  | "SOURCE_NOT_FOUND"
  | "MIRROR_UNRESOLVED"
  | "NETWORK"
  | "PARSE"
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "UNKNOWN";

export function toAppError(error: unknown, defaultCode: AppErrorCode = "UNKNOWN"): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) return new AppError(defaultCode, error.message, error);
  return new AppError(defaultCode, String(error));
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  SOURCE_NOT_FOUND: "No se encontró ninguna fuente de video disponible para este contenido",
  MIRROR_UNRESOLVED: "El servidor de video no respondió. Intenta con otra fuente",
  NETWORK: "Error de conexión. Verifica tu conexión a internet",
  PARSE: "El servidor devolvió una respuesta inesperada. Intenta más tarde",
  UNAUTHORIZED: "Sesión no válida con el servicio. Revisa la configuración",
  RATE_LIMITED: "Demasiadas solicitudes. Espera un momento e intenta de nuevo",
  UNKNOWN: "Ocurrió un error inesperado. Intenta de nuevo",
};

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return ERROR_MESSAGES[error.code] ?? error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return ERROR_MESSAGES.UNKNOWN;
}