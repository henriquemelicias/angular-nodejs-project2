import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HttpSettings } from "@core/constants/http-settings.const";

import { UserSchema } from "@data/user/schemas/user.schema";
import { AuthStorageService } from "@core/services/auth-storage/auth-storage.service";
import { Router } from "@angular/router";
import { LoggerService } from "@core/services/logger/logger.service";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { UserService } from "@data/user/services/user.service";

export interface LoginInput {
    username: string,
    password: string
}

export interface LoginOutput extends UserSchema {token: string}

export interface RegisterInput {
    username: string,
    password: string
}

@Injectable( {
                 providedIn: 'root'
             } )
export class AuthService {

    constructor( private http: HttpClient, private authStorage: AuthStorageService, private router: Router ) {
    }

    login( loginInput: LoginInput ): Observable<LoginOutput> {
        return this.http.post<LoginOutput>(
            HttpSettings.API_URL + '/auth/login',
            loginInput,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    register( registerInput: RegisterInput ): Observable<void> {
        return this.http.post<void>(
            HttpSettings.API_URL + '/auth/register',
            registerInput,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    static isLoggedIn(): boolean {
        return AuthStorageService.getToken() !== null && UserService.sessionUser !== undefined;
    }


    logout() {
        UserService.setSessionUser( undefined );
        AuthStorageService.clearTokens();

        this.router.navigate( [ '/home' ], ).then(
            _ => {
                setTimeout( () => {
                    LoggerService.info(
                        'Redirected to / due to logout.',
                        LoggerService.setCaller( this, this.logout )
                    );

                    AlertService.alertToApp( AlertType.Success, 'Logout successful', { isAutoClosed: true } );
                } );
            },
            error => {
                LoggerService.error(
                    'Redirect to / unsuccessful: ' + JSON.stringify( error ),
                    LoggerService.setCaller( this, this.logout )
                );

                AlertService.alertToApp( AlertType.Error, JSON.stringify( error ) );
            }
        );

    }
}
