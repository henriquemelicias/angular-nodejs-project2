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
import { UserService } from "@data/user/services/user.service";

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

    constructor() {}

    intercept( request: HttpRequest<unknown>, next: HttpHandler ): Observable<HttpEvent<unknown>> {
        let requestMaybeWithToken = request;
        const token = AuthStorageService.getToken();

        if ( token && UserService.sessionUser ) {
            LoggerService.info(
                'User auth token put as header on request: ' + token,
                LoggerService.setCaller( this, this.intercept )
            );

            // Add token and current authenticated user role.
            const reqHeaders = request.headers
                   .set( HttpCustomHeaderEnum.CsrfToken, token )
                   .set( HttpCustomHeaderEnum.UserRoles, UserService.sessionUser.roles )

            requestMaybeWithToken = request.clone( { headers: reqHeaders } )
        }

        return next.handle( requestMaybeWithToken );
    }
}
