import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarUserRoutingModule } from "./calendar-user-routing.module";
import { UserCalendarComponent } from "@modules/calendar-user/pages/user-calendar.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule } from "angular-calendar";
import { MatRadioModule } from '@angular/material/radio';
import { UserAgendaFormComponent } from "@modules/calendar-user/components/user-agenda-form/user-agenda-form.component";
import { UserMeetingFormComponent } from "@modules/calendar-user/components/user-meeting-form/user-meeting-form.component";


@NgModule({
  declarations: [
      UserCalendarComponent,
      UserAgendaFormComponent,
      UserMeetingFormComponent
  ],
              imports: [
                  CommonModule,
                  SharedModule,
                  CalendarUserRoutingModule,
                  FormsModule,
                  CalendarModule,
                  MatRadioModule,
                  ReactiveFormsModule,
                  NgbModalModule,
                  FlatpickrModule
              ]
          })
export class CalendarUserModule { }
