import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlogEntryComponent } from './pages/blog-entry.component';

export const routes: Routes = [
  { path: '', component: BlogEntryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogEntryRoutingModule {}
