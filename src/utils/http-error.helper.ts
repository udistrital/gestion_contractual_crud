import { HttpException } from '@nestjs/common';
import { StandardResponse } from './standardResponse.interface';

/**
 * Construye la respuesta de error respetando el código que lanzó el servicio.
 * Sin esto, un BadRequestException de una regla de negocio se reporta con el
 * código genérico del bloque catch (por ejemplo 404) y el motivo real queda
 * oculto en Data.
 */
export function buildErrorResponse(
  error: unknown,
  fallbackStatus: number,
  fallbackMessage: string,
): { status: number; response: StandardResponse<string> } {
  const esHttpException = error instanceof HttpException;
  const status = esHttpException ? error.getStatus() : fallbackStatus;
  const detalle = esHttpException
    ? error.message
    : fallbackMessage;

  return {
    status,
    response: {
      Success: false,
      Status: status,
      Message: detalle,
      Data: detalle,
    },
  };
}