import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectInfoComponent } from './pages/project-info.component';

export const routes: Routes = [
    { path: '', component: ProjectInfoComponent },
];

@NgModule( {
               imports: [ RouterModule.forChild( routes ) ],
               exports: [ RouterModule ]
           } )
export class ProjectInfoRoutingModule {}
