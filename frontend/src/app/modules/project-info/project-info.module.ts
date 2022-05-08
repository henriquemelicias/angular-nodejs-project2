import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { ProjectInfoComponent } from './pages/project-info.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ProjectInfoRoutingModule } from "@modules/project-info/project-info-routing.module";


@NgModule( {
               declarations: [
                 ProjectInfoComponent
               ],
               imports: [
                   CommonModule,
                   SharedModule,
                   ProjectInfoRoutingModule,
                   FormsModule,
                   ReactiveFormsModule
               ]
           } )
export class ProjectInfoModule {}
