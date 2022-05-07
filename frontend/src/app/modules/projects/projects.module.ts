import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { ProjectsRoutingModule } from "./projects-routing.module";

import { ProjectsComponent } from './pages/projects.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AddProjectFormComponent } from './components/add-project-form/add-project-form.component';
import { NgbAccordionModule, NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule( {
               declarations: [
                   ProjectsComponent,
                   AddProjectFormComponent
               ],
               imports: [
                   CommonModule,
                   SharedModule,
                   ProjectsRoutingModule,
                   FormsModule,
                   ReactiveFormsModule,
                   NgbAccordionModule,
                   NgbPaginationModule
               ]
           } )
export class ProjectsModule {}
