import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { throwIfAlreadyLoaded } from "./utils/function-throw-loaded-module.util";

// Route
import { RouterModule } from "@angular/router";

// Guard
import { AuthGuard } from "./guards/auth.guard";

// Interceptor
import { AuthTokenInterceptor } from "./interceptors/token/auth-token.interceptor";

// Core components
import { NotFoundComponent } from './components/not-found/not-found.component';
import { TaskComponent } from './components/task/task.component';
import { TeamComponent } from './components/team/team.component';


@NgModule( {
  imports: [ HttpClientModule, RouterModule ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    NotFoundComponent,
    TaskComponent,
    TeamComponent
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
