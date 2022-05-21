import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeamCalendarComponent } from "@modules/calendar-team/pages/team-calendar.component";

export const routes: Routes = [
  { path: '', component: TeamCalendarComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarTeamRoutingModule {}
