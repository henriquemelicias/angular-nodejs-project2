import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from "@core/services/auth/auth.service";

@Injectable( {
               providedIn: 'root'
             } )
export class NotAuthGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown> {

  constructor( private auth: AuthService, private router: Router ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return !this._changeRouteIfAuthenticated();
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return !this._changeRouteIfAuthenticated();
  }

  canLoad(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return !this._changeRouteIfAuthenticated();
  }

  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return !this._changeRouteIfAuthenticated();
  }

  private _changeRouteIfAuthenticated() {
    if ( AuthService.isLoggedIn() ) {
      this.router.navigate( [ '/home' ] ).then();
      return true;
    }
    else {
      return false;
    }
  }

}
