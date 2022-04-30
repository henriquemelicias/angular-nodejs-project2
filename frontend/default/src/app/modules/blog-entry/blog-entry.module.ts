import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "@shared/shared.module";

import { BlogEntryRoutingModule } from "./blog-entry-routing.module";

import { BlogEntryComponent } from './pages/blog-entry.component';


@NgModule({
  declarations: [
    BlogEntryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    BlogEntryRoutingModule
  ]
})
export class BlogEntryModule { }
