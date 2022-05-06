import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { TeamsRoutingModule } from "./teams-routing.module";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AddTeamFormComponent } from './components/add-team-form/add-team-form.component';
import { TeamsComponent } from './pages/teams.component';

@NgModule( {
               declarations: [
                   AddTeamFormComponent,
                   TeamsComponent
               ],
               imports: [
                   CommonModule,
                   SharedModule,
                   TeamsRoutingModule,
                   FormsModule,
                   ReactiveFormsModule
               ]
           } )
export class TeamsModule {}
