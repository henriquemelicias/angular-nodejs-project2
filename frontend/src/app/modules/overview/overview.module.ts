import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { OverviewRoutingModule } from "./overview-routing.module";

import { OverviewComponent } from './pages/overview.component';
import { NgxGraphModule } from "@swimlane/ngx-graph";


@NgModule({
  declarations: [
    OverviewComponent
  ],
              imports: [
                  CommonModule,
                  SharedModule,
                  OverviewRoutingModule,
                  NgxGraphModule,
              ]
          })
export class OverviewModule { }
