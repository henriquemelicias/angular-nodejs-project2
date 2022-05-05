import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { throwIfAlreadyLoaded } from "./utils/function-throw-loaded-module.util";

// Route
import { RouterModule } from "@angular/router";

// Guards
import { AuthGuard } from "./guards/auth.guard";
import { AuthAdminGuard } from "./guards/auth-admin.guard";

// Interceptor
import { AuthTokenInterceptor } from "./interceptors/token/auth-token.interceptor";
import { ErrorInterceptor } from "@core/interceptors/error/error.interceptor";

// Core components
import { NotFoundComponent } from './components/not-found/not-found.component';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";


@NgModule( {
               imports: [ HttpClientModule, RouterModule, FontAwesomeModule ],
               providers: [
                   AuthAdminGuard,
                   AuthGuard,
                   {
                       provide: HTTP_INTERCEPTORS,
                       useClass: AuthTokenInterceptor,
                       multi: true
                   },
                   {
                       provide: HTTP_INTERCEPTORS,
                       useClass: ErrorInterceptor,
                       multi: true
                   },
               ],
               declarations: [
                   NotFoundComponent
               ],
               exports: [
                   NotFoundComponent
               ]
           } )
export class CoreModule {
    constructor( @Optional() @SkipSelf() parentModule: CoreModule ) {
        throwIfAlreadyLoaded( parentModule, 'CoreModule' );
    }
}
