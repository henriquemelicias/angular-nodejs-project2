import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from "@angular/forms";

import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MdbModalModule } from 'mdb-angular-ui-kit/modal';

import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthTokenInterceptor } from "@core/interceptors/token/auth-token.interceptor";
import { ErrorInterceptor } from "@core/interceptors/error/error.interceptor";

import { HeaderComponent } from "@app/layout/header/header.component";
import { ContentLayoutComponent } from "@app/layout/content-layout/content-layout.component";
import { FooterComponent } from "@app/layout/footer/footer.component";
import { FooterScrollUpButtonComponent } from './layout/footer-scroll-up-button/footer-scroll-up-button.component';
import { ProjectTeamComponent } from './modules/project-team/project-team.component';
import { ProjectTaskComponent } from './modules/project-task/project-task.component';
import { TaskComponent } from './modules/task/task.component';

@NgModule({
  declarations: [
    AppComponent,

    // Layout
    HeaderComponent,
    ContentLayoutComponent,
    FooterComponent,
    FooterScrollUpButtonComponent,
    ProjectTeamComponent,
    ProjectTaskComponent,
    TaskComponent,
  ],
  imports: [
    // Angular
    BrowserModule,

    // Core and shared
    CoreModule,
    SharedModule,

    // 3rd party
    NgbModule,
    MdbModalModule,

    // Routing and forms
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
