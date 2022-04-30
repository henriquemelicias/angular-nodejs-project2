import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoggerService } from "@core/services/logger/logger.service";
import { AuthStorageService } from "@core/services/auth-storage/auth-storage.service";

import { HttpCustomHeaderEnum } from "@core/enums/http-custom-header.enum";

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  constructor(  ) {}

  intercept( request: HttpRequest<unknown>, next: HttpHandler ): Observable<HttpEvent<unknown>> {
    let requestMaybeWithToken = request;
    const token = AuthStorageService.getToken();

    if ( token ) {
      LoggerService.info( 'User auth token put as header on request: ' + token,
                          LoggerService.setCaller( this, this.intercept ) );
      requestMaybeWithToken = request.clone( { headers: request.headers.set( HttpCustomHeaderEnum.CsrfToken, token ) } )
    }

    return next.handle( requestMaybeWithToken );
  }
}
