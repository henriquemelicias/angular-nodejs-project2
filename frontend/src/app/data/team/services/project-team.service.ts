import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpSettings } from '@core/constants/http-settings.const';
import { TeamSchema } from '../schemas/team.schema';
import { Observable, observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectTeamService {

  private url = HttpSettings.API_URL + "/team/"

  constructor(
    private http: HttpClient
  ) { }

  addTeam(team: TeamSchema): Observable<TeamSchema>{
    return this.http.post<TeamSchema>( this.url + team.name, team, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }
}
