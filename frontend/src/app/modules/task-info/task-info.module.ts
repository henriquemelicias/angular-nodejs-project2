import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { TaskInfoRoutingModule } from './task-info-routing.module';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GetTaskInfoComponent } from './components/get-task-info/get-task-info.component';
import { TaskInfoComponent } from './pages/task-info.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";




@NgModule({
  declarations: [
    TaskInfoComponent,
    GetTaskInfoComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    TaskInfoRoutingModule,
    NgbModule
  ]
})
export class TaskInfoModule { }
