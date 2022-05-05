import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpSettings } from '@core/constants/http-settings.const';
import { ProjectSchema } from '../schemas/project.schema';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ProjectService {

  private projectUrl = HttpSettings.API_URL + "/project-info/";
  constructor(private http: HttpClient) { }

  //Post
  addProject(project: ProjectSchema): Observable<ProjectSchema> {
    return this.http.post<ProjectSchema>( this.projectUrl + project.name, project, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }

  getProjects(): Observable<ProjectSchema[]> {
    return this.http.get<ProjectSchema[]>( HttpSettings.API_URL + "/projects");
  }

}