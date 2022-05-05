import { Component, OnInit, Optional } from '@angular/core';
import { ProjectTeamService } from './project-team.service';
import { Team } from './team';
import { UserSchema } from '@app/data/user/schemas/user.schema';
import { Project } from '../project/project';
import { ProjectService } from '../project/project.service';
import { FormControl, FormGroup, NgForm } from '@angular/forms';

@Component({
  selector: 'app-project-team',
  templateUrl: './project-team.component.html',
  styleUrls: ['./project-team.component.css']
})
export class ProjectTeamComponent implements OnInit {

  users: UserSchema[] = [];
  projects: Project[] = [];
  team: Team | undefined;

  constructor(
    private teamService: ProjectTeamService,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    this.getProjects();
  }

  add(team_name: string, team_project: String): void {
    const project = this.searchProject(team_project);
    if(project) {
      this.teamService.addTeam({name: team_name, project: project, members: this.users} as Team);
    }
    
  }

  getProjects(): void {
    this.projectService.getProjects()
        .subscribe(projects => this.projects = projects);
  }

  searchProject(name: String): Project | undefined {
    var project: Project | undefined;
    this.projects.forEach(p => {
      if (name === p.name) {
        project = p;
      }
    });
    return project;
  }

}
