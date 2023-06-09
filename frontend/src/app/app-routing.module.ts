import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContentLayoutComponent } from '@layout/content-layout/content-layout.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { NotFoundComponent } from "@core/components/not-found/not-found.component";
import { NotAuthGuard } from "@core/guards/not-auth.guard";
import { AuthAdminGuard } from "@core/guards/auth-admin.guard";

const routes: Routes = [
    // Initial page.
    { path: '', redirectTo: '/about', pathMatch: 'full' },
    // Main modules.
    {
        path: '',
        component: ContentLayoutComponent,
        children: [
            // Fallback when no prior routes is matched.
            { path: '404', pathMatch: 'full', component: NotFoundComponent },
            // Lazy loading:
            {
                path: 'about',
                loadChildren: () =>
                    import('@modules/about/about.module').then( m => m.AboutModule )
            },
            {
                path: 'overview',
                canLoad: [ AuthGuard ],
                loadChildren: () =>
                    import('@modules/overview/overview.module').then( m => m.OverviewModule )
            },
            {
                path: 'login',
                canLoad: [ NotAuthGuard ],
                loadChildren: () =>
                    import('@modules/login/login.module').then( m => m.LoginModule )
            },
            {
                path: 'users',
                canLoad: [ AuthGuard ],
                loadChildren: () =>
                    import('@modules/users/users.module').then( m => m.UsersModule )
            },
            {
                path: 'profile',
                canLoad: [ AuthGuard ],
                loadChildren: () =>
                    import('@modules/profile/profile.module').then( m => m.ProfileModule )
            },
            {
                path: 'teams',
                canLoad: [ AuthGuard ],
                loadChildren: () =>
                    import('@modules/teams/teams.module').then( m => m.TeamsModule )
            },
            {
                path: 'teams/:name',
                canLoad: [ AuthGuard ],
                loadChildren: () =>
                    import('@modules/team-info/team-info.module').then( m => m.TeamInfoModule )
            },
            {
                path: 'projects',
                canLoad: [ AuthGuard ],
                loadChildren: () =>
                    import('@modules/projects/projects.module').then( m => m.ProjectsModule )
            },
            {
                path: 'projects/:acronym',
                canLoad: [ AuthGuard ],
                loadChildren: () =>
                    import( '@modules/project-info/project-info.module').then( m => m.ProjectInfoModule )
            },
            {
                path: 'tasks',
                canLoad: [ AuthGuard ],
                loadChildren: () =>
                    import('@modules/tasks/tasks.module').then( m => m.TasksModule )
            },
            {
                path: 'tasks/:_id',
                canLoad: [ AuthGuard ],
                loadChildren: () =>
                    import('@modules/task-info/task-info.module').then(m => m.TaskInfoModule)
            },
            {
                path: 'users/:username/calendar',
                canLoad: [ AuthGuard ],
                loadChildren: () =>
                    import( '@modules/calendar-user/calendar-user.module').then( m => m.CalendarUserModule ),
            },
            {
                path: 'teams/:name/calendar',
                canLoad: [ AuthGuard ],
                loadChildren: () =>
                    import( '@modules/calendar-team/calendar-team.module').then( m => m.CalendarTeamModule ),
            }
        ]
    },
    { path: '**', redirectTo: '404', pathMatch: 'full' }
];

@NgModule( {
               imports: [
                   RouterModule.forRoot( routes, { useHash: false, scrollPositionRestoration: 'enabled' } )
               ],
               exports: [ RouterModule ],
               providers: []
           } )
export class AppRoutingModule {}
