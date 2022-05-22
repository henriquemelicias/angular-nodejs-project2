import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { CalendarTeamRoutingModule } from "./calendar-team-routing.module";

import { TeamCalendarComponent } from "@modules/calendar-team/pages/team-calendar.component";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule } from "angular-calendar";
import { MatRadioModule } from '@angular/material/radio';
import { FlatpickrModule } from 'angularx-flatpickr';
import { TeamAgendaFormComponent } from "@modules/calendar-team/components/team-agenda-form/team-agenda-form.component";


@NgModule({
  declarations: [
      TeamCalendarComponent,
      TeamAgendaFormComponent
  ],
              imports: [
                  CommonModule,
                  SharedModule,
                  CalendarTeamRoutingModule,
                  CommonModule,
                  SharedModule,
                  FormsModule,
                  CalendarModule,
                  MatRadioModule,
                  ReactiveFormsModule,
                  NgbModalModule,
                  FlatpickrModule
              ]
          })
export class CalendarTeamModule { }
