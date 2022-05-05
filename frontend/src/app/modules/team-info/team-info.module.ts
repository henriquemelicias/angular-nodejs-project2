import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { RegisterRoutingModule } from "@modules/register/register-routing.module";

import { TeamInfoComponent } from './pages/team-info.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


@NgModule( {
               declarations: [
                 TeamInfoComponent
               ],
               imports: [
                   CommonModule,
                   SharedModule,
                   RegisterRoutingModule,
                   FormsModule,
                   ReactiveFormsModule
               ]
           } )
export class TeamInfoModule {}
