import { Injectable } from '@angular/core';

import { UserSchema } from "@data/user/schemas/user.schema";
import { BehaviorSubject, Observable } from "rxjs";
import { AuthStorageService } from "@core/services/auth-storage/auth-storage.service";
import { AuthRolesEnum } from "@data/user/enums/auth-roles.enum";
import { HttpClient } from "@angular/common/http";
import { HttpSettings } from "@core/constants/http-settings.const";

@Injectable( {
                 providedIn: 'root'
             } )
export class UserService {

    public static sessionUser?: UserSchema;

    private static _sessionUser$ = new BehaviorSubject<UserSchema | undefined>( undefined );
    private static _API_URI = HttpSettings.API_URL + "/users";

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

    public static isSessionUser(): boolean {
        if ( this.sessionUser ) return true;

        return false;
    }

    public getUsers(): Observable<UserSchema[]> {
        return this.http.get<UserSchema[]>( UserService._API_URI, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }
}
