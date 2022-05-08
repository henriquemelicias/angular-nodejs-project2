import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { TeamInfoComponent } from './pages/team-info.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TeamInfoRoutingModule } from "@modules/team-info/team-info-routing.module";


@NgModule( {
               declarations: [
                 TeamInfoComponent
               ],
               imports: [
                   CommonModule,
                   SharedModule,
                   TeamInfoRoutingModule,
                   FormsModule,
                   ReactiveFormsModule
               ]
           } )
export class TeamInfoModule {
}
