import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserCalendarComponent } from "@modules/calendar-user/pages/user-calendar.component";

export const routes: Routes = [
  { path: '', component: UserCalendarComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarUserRoutingModule {}
