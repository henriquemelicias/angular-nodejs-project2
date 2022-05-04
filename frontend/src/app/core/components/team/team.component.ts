import { Component, OnInit } from '@angular/core';
import { TeamService } from '@app/core/services/team/team.service';
import { Team } from '@app/core/models/team';
import { UserSchema } from '@app/data/user/schemas/user.schema';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  users: UserSchema[] = [];

  constructor(
    private teamService: TeamService
  ) { }

  ngOnInit(): void {
  }

  add(team_name: string): void {
    team_name = team_name.trim();
    this.teamService.addTeam({ name: team_name, members: this.users } as Team);    
  }

}
