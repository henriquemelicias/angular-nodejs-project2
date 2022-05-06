import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from "@angular/forms";

import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MdbModalModule } from 'mdb-angular-ui-kit/modal';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { HeaderComponent } from "@app/layout/header/header.component";
import { ContentLayoutComponent } from "@app/layout/content-layout/content-layout.component";
import { FooterComponent } from "@app/layout/footer/footer.component";
import { FooterScrollUpButtonComponent } from '@layout/footer-scroll-up-button/footer-scroll-up-button.component';

@NgModule({
  declarations: [
    AppComponent,

    // Layout
    HeaderComponent,
    ContentLayoutComponent,
    FooterComponent,
    FooterScrollUpButtonComponent,
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
    FontAwesomeModule,

    // Routing and forms
    AppRoutingModule,
    FormsModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
