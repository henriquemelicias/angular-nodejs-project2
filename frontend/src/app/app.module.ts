import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MdbModalModule } from 'mdb-angular-ui-kit/modal';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from "angularx-flatpickr";

import { HeaderComponent } from "@app/layout/header/header.component";
import { ContentLayoutComponent } from "@app/layout/content-layout/content-layout.component";
import { FooterComponent } from "@app/layout/footer/footer.component";
import { FooterScrollUpButtonComponent } from '@layout/footer-scroll-up-button/footer-scroll-up-button.component';


@NgModule(
    {
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
            BrowserAnimationsModule,

            // Core and shared
            CoreModule,
            SharedModule,

            // 3rd party
            NgbModule,
            MdbModalModule,
            FontAwesomeModule,
            FlatpickrModule.forRoot(),
            CalendarModule.forRoot(
                {
                    provide: DateAdapter,
                    useFactory: adapterFactory,
                } ),

            // Routing and forms
            AppRoutingModule,
            FormsModule,
        ],
        providers: [],
        bootstrap: [ AppComponent ]
    } )
export class AppModule {
}
