import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { TaskInfoRoutingModule } from './task-info-routing.module';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TaskInfoComponent } from './pages/task-info.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";


@NgModule({
  declarations: [
    TaskInfoComponent,
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
