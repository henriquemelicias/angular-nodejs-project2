import { Component, OnInit, Optional } from '@angular/core';
import { ProjectTeamService } from '../../../data/team/services/project-team.service';
import { TeamSchema } from '@data/team/schemas/team.schema';
import { UserSchema } from '@data/user/schemas/user.schema';
import { ProjectSchema } from '../../../data/project/schemas/project.schema';
import { ProjectService } from '../../../data/project/services/project.service';
import { FormControl, FormGroup, NgForm } from '@angular/forms';

@Component({
  selector: 'app-projects-info-team',
  templateUrl: './team-info.component.html',
  styleUrls: [ './team-info.component.css']
})
export class TeamInfoComponent implements OnInit {

  users: UserSchema[] = [];
  projects: ProjectSchema[] = [];
  team: TeamSchema | undefined;

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
      this.teamService.addTeam({name: team_name, project: project, members: this.users} as TeamSchema);
    }
    
  }

  getProjects(): void {
    this.projectService.getProjects()
        .subscribe(projects => this.projects = projects);
  }

  searchProject(name: String): ProjectSchema | undefined {
    var project: ProjectSchema | undefined;
    this.projects.forEach(p => {
      if (name === p.name) {
        project = p;
      }
    });
    return project;
  }

}
