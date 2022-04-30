import { HttpErrorResponse } from "@angular/common/http";

export interface SanitizedErrorInterface extends Error {
  message: string,
  error: any | Error | HttpErrorResponse,
  hasBeenHandled: boolean
}
