import { Injectable } from '@angular/core';

import { UserSchema } from "@data/user/schemas/user.schema";
import { BehaviorSubject, Observable } from "rxjs";
import { AuthStorageService } from "@core/services/auth-storage/auth-storage.service";
import { AuthRolesEnum } from "@data/user/enums/auth-roles.enum";
import { HttpClient } from "@angular/common/http";
import { HttpSettings } from "@core/constants/http-settings.const";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";
import { LoggerService } from "@core/services/logger/logger.service";

@Injectable( {
                 providedIn: 'root'
             } )
export class UserService {

    public static sessionUser?: UserSchema;
    public static USERS_PER_PAGE = 10;

    private static _API_URI = HttpSettings.API_URL + "/users";
    private static _sessionUser$ = new BehaviorSubject<UserSchema | undefined>( undefined );
    private static _usersByPage$ = new BehaviorSubject<UserSchema[][] | undefined>( undefined );
    private static _currentUsersByPage?: UserSchema[][];

    static {
        const maybeUser = AuthStorageService.getUser();
        if ( maybeUser ) UserService.setSessionUser( maybeUser );
    }

    constructor( private http: HttpClient ) {
    }

    public static setSessionUser( user?: UserSchema ): void {
        this.sessionUser = user;
        this._sessionUser$.next( user );
    };

    public static getSessionUser$(): Observable<UserSchema | undefined> {
        return this._sessionUser$.asObservable();
    }

    public static isSessionUserAdmin(): boolean {
        if ( !this.sessionUser ) return false;

        return this.sessionUser.roles.includes( AuthRolesEnum.ADMIN );
    }

    public static hasSessionUser(): boolean {
        return !!this.sessionUser;
    }

    public getUsers(): Observable<UserSchema[]> {
        return this.http.get<UserSchema[]>( UserService._API_URI, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }

    getUserByUsername( username: string ) {
        return this.http.get<UserSchema>(
            UserService._API_URI + '/' + username, HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    public updateUser( user: UserSchema ): Observable<UserSchema> {
        return this.http.put<UserSchema>(
            UserService._API_URI + "/" + user._id,
            user,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    };

    public static getUsersByPage$(): Observable<UserSchema[][] | undefined> {
        return this._usersByPage$;
    }

    public getUsersByPage( numUsers: Number, numPage: Number ): Observable<UserSchema[]> {
        return this.http.get<UserSchema[]>(
            UserService._API_URI + '/by-pages?numUsers=' + numUsers + "&numPage=" + numPage,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    public getNumberOfUsers(): Observable<{ numberOfUsers: number }> {
        return this.http.get<{ numberOfUsers: number }>(
            UserService._API_URI + "/num-entries",
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        )
    }

    public loadUsersByPage( numPage: Number ) {
        UserService._currentUsersByPage = UserService._usersByPage$.getValue();
        UserService._currentUsersByPage = UserService._currentUsersByPage ? UserService._currentUsersByPage : [];

        while ( numPage > UserService._currentUsersByPage.length ) {
            UserService._currentUsersByPage.push( [] );
        }

        const index = Number( numPage ) - 1;

        this.getUsersByPage( UserService.USERS_PER_PAGE, numPage ).subscribe(
            {
                next: teams => {
                    if ( !UserService._currentUsersByPage ) return;

                    UserService._currentUsersByPage[index] = teams;
                    UserService._usersByPage$.next( UserService._currentUsersByPage );
                },
                error: ( error: SanitizedErrorInterface ) => {
                    if ( error.hasBeenHandled ) return;

                    const errorHandler = new AppErrorHandler( error );
                    errorHandler
                        .ifErrorHandlers( null, () => {
                            AlertService.alertToApp(
                                AlertType.Error,
                                GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                null,
                                LoggerService.setCaller( "TeamService", "loadUsersByPage" )
                            );
                        } ).toObservable();
                }
            } );
    }

    getUsersSameProject( taskId: string, taskName: string ) {
        return this.http.get<UserSchema[]>(
            UserService._API_URI + '/by-task?id=' + taskId + '&name=' + taskName,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    getUsersByTeam( team: string ) {
        return this.http.get<UserSchema[]>(
            UserService._API_URI + '/by-team?name=' + team,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }
}
