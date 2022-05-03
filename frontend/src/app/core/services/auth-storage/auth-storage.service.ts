import { Injectable } from '@angular/core';
import { LocalStorageKeyEnum } from "@core/enums/local-storage-key.enum";
import { UserSchema } from "@data/user/schemas/user.schema";

@Injectable( {
  providedIn: 'root'
} )
export class AuthStorageService {
  constructor() {}

  public static saveToken( token: string ): void {
    window.localStorage.removeItem( LocalStorageKeyEnum.AUTH_TOKEN );
    window.localStorage.setItem( LocalStorageKeyEnum.AUTH_TOKEN, token );
  };

  public static getToken(): string | null {
    return window.localStorage.getItem( LocalStorageKeyEnum.AUTH_TOKEN );
  };

  public static saveUser( user: UserSchema ): void {
    window.localStorage.removeItem( LocalStorageKeyEnum.AUTH_USER );
    window.localStorage.setItem( LocalStorageKeyEnum.AUTH_USER, JSON.stringify( user ) );
  };

  public static getUser(): UserSchema | null {
    const user = window.localStorage.getItem( LocalStorageKeyEnum.AUTH_USER );

    return user ? JSON.parse( user ): null;
  };

  public static clearTokens(): void {
    window.localStorage.removeItem( LocalStorageKeyEnum.AUTH_USER );
    window.localStorage.removeItem( LocalStorageKeyEnum.AUTH_TOKEN );
  };
}
