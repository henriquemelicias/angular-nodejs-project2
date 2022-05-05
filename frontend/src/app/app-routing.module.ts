import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContentLayoutComponent } from './layout/content-layout/content-layout.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { NotFoundComponent } from "@core/components/not-found/not-found.component";
import { NotAuthGuard } from "@core/guards/not-auth.guard";
import { TaskComponent } from '@modules/task/task.component';
import { ProjectTeamComponent } from './modules/project-team/project-team.component';
import { ProjectComponent } from './modules/project/project.component';

const routes: Routes = [
  // Initial page.
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Main modules.
  {
    path: '',
    component: ContentLayoutComponent,
    children: [
      // Fallback when no prior routes is matched.
      { path: '404', pathMatch: 'full', component: NotFoundComponent },
      // Lazy loading:
      {
        path: 'task', component: TaskComponent},
      {
        path: 'team', component: ProjectTeamComponent
      },
      {
        path: 'project', component: ProjectComponent
      },
      {
        path: 'home',
        loadChildren: () =>
          import('@modules/home/home.module').then( m => m.HomeModule )
      },
      {
        path: 'about',
        loadChildren: () =>
          import('@modules/about/about.module').then( m => m.AboutModule )
      },
      {
        path: 'contact',
        loadChildren: () =>
          import('@modules/contact/contact.module').then( m => m.ContactModule )
      },
      {
        path: 'login',
        canLoad: [NotAuthGuard],
        loadChildren: () =>
          import('@modules/login/login.module').then( m => m.LoginModule )
      },
      {
        path: 'register',
        canLoad: [NotAuthGuard],
        loadChildren: () =>
          import('@modules/register/register.module').then( m => m.RegisterModule )
      },
      {
        path: 'profile',
        canLoad: [AuthGuard],
        loadChildren: () =>
          import('@modules/profile/profile.module').then( m => m.ProfileModule )
      },
      {
        path: 'blog/:id',
        loadChildren: () =>
          import('@modules/blog-entry/blog-entry.module').then( m => m.BlogEntryModule )
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
