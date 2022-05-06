import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from "@core/services/auth/auth.service";
import { LoggerService } from "@core/services/logger/logger.service";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { UserService } from "@data/user/services/user.service";

@Injectable( {
                 providedIn: 'root'
             } )
export class AuthAdminGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown> {

    constructor( private auth: AuthService, private router: Router ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this._changeRouteIfNotAdmin();
    }

    canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this._changeRouteIfNotAdmin();
    }

    canLoad(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this._changeRouteIfNotAdmin();
    }

    canDeactivate(
        component: unknown,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this._changeRouteIfNotAdmin();
    }

    private _changeRouteIfNotAdmin() {
        if ( UserService.isSessionUserAdmin() ) {
            return true;
        }
        else {
            const logCallers = LoggerService.setCaller( this, this._changeRouteIfNotAdmin );
            this.router.navigate( [ '/home' ] ).then(
                _ => {
                    setTimeout( () => {
                        LoggerService.warn(
                            'Redirected to /home due to unauthorized admin router access attempt.',
                            logCallers
                        );

                        AlertService.alertToApp( AlertType.Warning, 'Admin auth is required', { isAutoClosed: true } );
                    } );
                },
                error => {
                    LoggerService.error(
                        'Redirect to /home unsuccessful: ' + JSON.stringify( error ),
                        logCallers
                    );

                    AlertService.alertToApp( AlertType.Error, JSON.stringify( error ) );
                }
            );

            return false;
        }
    }
}
