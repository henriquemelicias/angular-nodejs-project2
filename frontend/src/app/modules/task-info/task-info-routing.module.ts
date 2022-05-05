import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskInfoComponent } from './pages/task-info.component';

export const routes: Routes = [
  { path: '', component: TaskInfoComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskInfoRoutingModule {}
