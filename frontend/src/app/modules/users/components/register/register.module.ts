import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { RegisterRoutingModule } from "@modules/users/components/register/register-routing.module";

import { RegisterComponent } from './pages/register.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";



@NgModule( {
               declarations: [
                   RegisterComponent
               ],
               exports: [
                   RegisterComponent
               ],
               imports: [
                   CommonModule,
                   SharedModule,
                   RegisterRoutingModule,
                   FormsModule,
                   ReactiveFormsModule
               ]
           })
export class RegisterModule { }
