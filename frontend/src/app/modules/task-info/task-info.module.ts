import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { RegisterRoutingModule } from "@modules/register/register-routing.module";

import { TaskInfoComponent } from './pages/task-info.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";



@NgModule({
  declarations: [
    TaskInfoComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RegisterRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class TaskInfoModule { }
