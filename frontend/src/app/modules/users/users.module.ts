import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { UsersRoutingModule } from "./users-routing.module";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UsersComponent } from './pages/users.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RegisterModule } from "@modules/users/components/register/register.module";

@NgModule( {
               declarations: [
                   UsersComponent,
               ],
               exports: [
                   UsersComponent
               ],
               imports: [
                   CommonModule,
                   SharedModule,
                   UsersRoutingModule,
                   FormsModule,
                   ReactiveFormsModule,
                   NgbModule,
                   RegisterModule
               ]
           } )
export class UsersModule {}
