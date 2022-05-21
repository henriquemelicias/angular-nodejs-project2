import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { ProfileRoutingModule } from "./profile-routing.module";

import { ProfileComponent } from './pages/profile.component';
import { TasksModule } from "@modules/tasks/tasks.module";
import { ReactiveFormsModule } from "@angular/forms";


@NgModule( {
  declarations: [
    ProfileComponent
  ],
               imports: [
                   CommonModule,
                   SharedModule,
                   ProfileRoutingModule,
                   TasksModule,
                   ReactiveFormsModule
               ]
           } )
export class ProfileModule {}
