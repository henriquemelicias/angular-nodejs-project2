import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from "@core/services/auth/auth.service";
import { LoggerService } from "@core/services/logger/logger.service";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";

@Injectable( {
               providedIn: 'root'
             } )
export class AuthGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown> {

  constructor( private auth: AuthService, private router: Router ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this._changeRouteIfNotAuthenticated();
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this._changeRouteIfNotAuthenticated();
  }

  canLoad(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this._changeRouteIfNotAuthenticated();
  }

  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this._changeRouteIfNotAuthenticated();
  }

  private _changeRouteIfNotAuthenticated() {
    if ( AuthService.isLoggedIn() ) {
      return true;
    }
    else {
      const logCallers = LoggerService.setCaller( this, this._changeRouteIfNotAuthenticated );
      this.router.navigate( [ '/login' ] ).then(
        _ => {
          setTimeout( () => {
            LoggerService.warn(
              'Redirected to /login due to unauthenticated user router access attempt.',
              logCallers
            );

            AlertService.alertToApp( AlertType.Warning, 'Authentication is required', { isAutoClosed: true } );
          } );
        },
        error => {
          LoggerService.error(
            'Redirect to /login unsuccessful: ' + JSON.stringify( error ),
            logCallers
          );

          AlertService.alertToApp( AlertType.Error, JSON.stringify( error ) );
        }
      );

      return false;
    }
  }
}
