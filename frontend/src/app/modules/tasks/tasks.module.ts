import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { TasksRoutingModule } from "./tasks-routing.module";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AddTaskFormComponent } from './components/add-task-form/add-task-form.component';
import { TasksComponent } from './pages/tasks.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule( {
               declarations: [
                   TasksComponent,
                   AddTaskFormComponent,
               ],
               imports: [
                   CommonModule,
                   SharedModule,
                   TasksRoutingModule,
                   FormsModule,
                   ReactiveFormsModule,
                   NgbModule
               ]
           } )
export class TasksModule {}
