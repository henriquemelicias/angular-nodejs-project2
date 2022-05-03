import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { HttpErrorResponse } from "@angular/common/http";
import { Observable, of } from "rxjs";

export class AppErrorHandler {

  public sanitizedError: SanitizedErrorInterface;

  constructor( sanitizedError: SanitizedErrorInterface ) {
    this.sanitizedError = sanitizedError;
  }

  get name() {
    return this.sanitizedError.name;
  }

  set name( name: string ) {
    this.sanitizedError.name = name;
  }

  get error() {
    return this.sanitizedError.error;
  }

  set error( error: Error | HttpErrorResponse | any ) {
    this.sanitizedError.error = error;
  }

  get message() {
    return this.sanitizedError.message;
  }

  set message( message: string ) {
    this.sanitizedError.message = message;
  }

  get hasBeenHandled() {
    return this.sanitizedError.hasBeenHandled;
  }

  set hasBeenHandled( hasBeenHandled: boolean ) {
    this.sanitizedError.hasBeenHandled = hasBeenHandled;
  }

  public clientErrorHandler( fn: () => void ): AppErrorHandler {
    if ( this.sanitizedError.error instanceof Error ) {
      fn();
    }

    return this;
  }

  public serverErrorHandler( fn: () => void ): AppErrorHandler {
    if ( this.sanitizedError.error instanceof HttpErrorResponse ) {
      fn();
    }

    return this;
  }

  public otherErrorHandler( fn: () => void ): AppErrorHandler {
    if ( !(this.sanitizedError.error instanceof HttpErrorResponse) && !(this.sanitizedError.error instanceof Error) ) {
      fn();
    }

    return this;
  }

  public executeFunction( fn: () => void ): AppErrorHandler {
    fn();
    return this;
  }

  public ifErrorHandlers( errorHandledFn?: (() => void) | null,
                          errorNotHandledFn?: (() => void) | null ): AppErrorHandler {
    if ( this.sanitizedError.hasBeenHandled ) {
      if ( errorHandledFn ) errorHandledFn();
    }
    else {
      if ( errorNotHandledFn ) errorNotHandledFn();
    }

    return this;
  }

  public toObservable(): Observable<SanitizedErrorInterface> {
    return of( this.sanitizedError );
  }
}
