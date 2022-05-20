import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { OverviewRoutingModule } from "./overview-routing.module";

import { OverviewComponent } from './pages/overview.component';
import { NgxGraphModule } from "@swimlane/ngx-graph";
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from "@angular/forms";


@NgModule( {
               declarations: [
                   OverviewComponent
               ],
               imports: [
                   CommonModule,
                   SharedModule,
                   OverviewRoutingModule,
                   NgxGraphModule,
                   MatRadioModule,
                   FormsModule,
               ],
           } )
export class OverviewModule {}
