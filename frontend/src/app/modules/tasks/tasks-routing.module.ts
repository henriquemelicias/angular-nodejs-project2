import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TasksComponent } from './pages/tasks.component';

export const routes: Routes = [
    { path: '', component: TasksComponent },
];

@NgModule( {
               imports: [ RouterModule.forChild( routes ) ],
               exports: [ RouterModule ]
           } )
export class TasksRoutingModule {}