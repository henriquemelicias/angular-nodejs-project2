import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpSettings } from '@app/core/constants/http-settings.const';
import { Team } from '@app/core/models/team';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private teamUrl = HttpSettings.API_URL + "/team/"

  constructor(
    private http: HttpClient
  ) { }

  addTeam(team: Team): Observable<Team> {
    return this.http.post<Team>(this.teamUrl + team.name, team, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }

}
