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
import { LightboxComponent } from "@app/layout/lightbox/lightbox.component";
import { FooterComponent } from "@app/layout/footer/footer.component";
import { FooterSubscriptionFormComponent } from './layout/footer-subscription-form/footer-subscription-form.component';
import { FooterScrollUpButtonComponent } from './layout/footer-scroll-up-button/footer-scroll-up-button.component';
import { FooterSocialMediaComponent } from './layout/footer-social-media/footer-social-media.component';
import { FooterThemeDropdownComponent } from './layout/footer-theme-dropdown/footer-theme-dropdown.component';

@NgModule({
  declarations: [
    AppComponent,

    // Layout
    HeaderComponent,
    ContentLayoutComponent,
    LightboxComponent,
    FooterComponent,
    FooterSubscriptionFormComponent,
    FooterScrollUpButtonComponent,
    FooterSocialMediaComponent,
    FooterThemeDropdownComponent,
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
