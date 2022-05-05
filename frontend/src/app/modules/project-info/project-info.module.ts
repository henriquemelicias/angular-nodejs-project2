import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { RegisterRoutingModule } from "@modules/register/register-routing.module";

import { ProjectInfoComponent } from './pages/project-info.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


@NgModule( {
               declarations: [
                 ProjectInfoComponent
               ],
               imports: [
                   CommonModule,
                   SharedModule,
                   RegisterRoutingModule,
                   FormsModule,
                   ReactiveFormsModule
               ]
           } )
export class ProjectInfoModule {}
