import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeamInfoComponent } from './pages/team-info.component';

export const routes: Routes = [
    { path: '', component: TeamInfoComponent },
];

@NgModule( {
               imports: [ RouterModule.forChild( routes ) ],
               exports: [ RouterModule ]
           } )
export class TeamInfoRoutingModule {}
