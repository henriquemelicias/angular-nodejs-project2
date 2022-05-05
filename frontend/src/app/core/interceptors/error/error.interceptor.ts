import { Injectable } from '@angular/core';
import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest, HttpStatusCode
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from "@angular/router";

import { LoggerService } from "@core/services/logger/logger.service";

import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor( private router: Router ) {}

  intercept( request: HttpRequest<unknown>, next: HttpHandler ): Observable<any> {
    return next.handle( request ).pipe(
      catchError( error => {

        const sanitizedError: SanitizedErrorInterface = {
          name: "",
          message: "",
          error: error,
          hasBeenHandled: false
        }

        const errorHandler = new AppErrorHandler( sanitizedError );

        errorHandler
          .clientErrorHandler( () => {

            errorHandler.name = errorHandler.error.name;
            errorHandler.message = (errorHandler.error.error && typeof errorHandler.error.error === 'string') ?
                                   errorHandler.error.error :
                                   errorHandler.name + ' ' + errorHandler.error.status + ' ' +
                                   errorHandler.error.statusText;
          } )
          .serverErrorHandler( () => {

            errorHandler.name = errorHandler.error.name;
            errorHandler.message = (errorHandler.error.error && typeof errorHandler.error.error === 'string') ?
                                   errorHandler.error.error :
                                   errorHandler.name + ' ' + errorHandler.error.status + ' ' +
                                   errorHandler.error.statusText;

            this._serverErrors( errorHandler);

          } )
          .otherErrorHandler( () => {

            errorHandler.name = "UnknownError";
            errorHandler.message = JSON.stringify( errorHandler.error );
          } )
          .ifErrorHandlers(
            () => LoggerService.error(
              LoggerService.setCaller( this, this.intercept ),
              "ErrorInterceptor.intercept -> " + errorHandler.message
            ),
            undefined
          );

        return throwError( () => errorHandler.sanitizedError );
      } )
    );

  }
    private _serverErrors( errorHandler: AppErrorHandler ) {
        const logCallers = LoggerService.setCaller( "ErrorInterceptor", "_serverErrors" );
        switch ( errorHandler.error.status ) {

            case HttpStatusCode.Unauthorized:
                if ( this.router.url !== '/login' ) {
                    this.router.navigateByUrl( '/login' )
                        .then(
                            _ => {
                                LoggerService.info(
                                    'Redirected to login due to server 401 HTTP response.',
                                    logCallers );
                                setTimeout( () => {
                                    AlertService.alertToApp( AlertType.Warning, `Unauthorized access`, { isAutoClosed: true }, logCallers );
                                } );
                            },
                            error => {
                                AlertService.alertToApp( AlertType.Error, JSON.stringify( error ), null, logCallers );
                            }
                        );
                    errorHandler.hasBeenHandled = true;
                }
                break;
            case HttpStatusCode.Forbidden:
                this.router.navigateByUrl( '/home' )
                    .then(
                        _ => {
                            LoggerService.info(
                                'Redirected to home due to server 403 HTTP response.',
                                logCallers );
                            setTimeout( () => {
                                AlertService.alertToApp( AlertType.Warning, `Forbidden access`, { isAutoClosed: true }, logCallers );
                            } );
                        },
                        error => {
                            AlertService.alertToApp( AlertType.Error, JSON.stringify( error ), null, logCallers );
                        }
                    );
                errorHandler.hasBeenHandled = true;
                break;
        }
    }
}
