import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { CalendarTeamRoutingModule } from "./calendar-team-routing.module";

import { TeamCalendarComponent } from "@modules/calendar-team/pages/team-calendar.component";



@NgModule({
  declarations: [
      TeamCalendarComponent,
  ],
              imports: [
                  CommonModule,
                  SharedModule,
                  CalendarTeamRoutingModule,
              ]
          })
export class CalendarTeamModule { }
