import { Injectable } from '@angular/core';

import { UserSchema } from "@data/user/schemas/user.schema";
import { BehaviorSubject, Observable } from "rxjs";
import { AuthStorageService } from "@core/services/auth-storage/auth-storage.service";
import { AuthRolesEnum } from "@data/user/enums/auth-roles.enum";

@Injectable( {
                 providedIn: 'root'
             } )
export class UserService {

    public static sessionUser?: UserSchema;
    private static _sessionUser$ = new BehaviorSubject<UserSchema | undefined>( undefined );

    static {
        const maybeUser = AuthStorageService.getUser();
        if ( maybeUser ) UserService.setSessionUser( maybeUser );
    }

    constructor() {
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
}
