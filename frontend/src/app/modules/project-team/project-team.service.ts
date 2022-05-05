import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpSettings } from '@app/core/constants/http-settings.const';
import { Team } from './team';
import { Observable, observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectTeamService {

  private url = HttpSettings.API_URL + "/team/"

  constructor(
    private http: HttpClient
  ) { }

  addTeam(team: Team): Observable<Team>{
    return this.http.post<Team>(this.url + team.name, team, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }
}
