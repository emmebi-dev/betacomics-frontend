import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../models/api-error.model';

export function extractErrorMessage(error: unknown, fallback = 'Si è verificato un errore imprevisto.'): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as ApiErrorResponse | undefined;
    if (body?.validationErrors?.length) {
      return body.validationErrors.map((v) => v.message).join(' — ');
    }
    if (body?.message) {
      return body.message;
    }
    if (error.status === 0) {
      return 'Impossibile contattare il server. Verifica che il backend sia in esecuzione.';
    }
    if (error.status === 401) {
      return 'Sessione scaduta o non autenticata. Effettua di nuovo il login.';
    }
    if (error.status === 403) {
      return 'Non hai i permessi necessari per questa operazione.';
    }
  }
  return fallback;
}
