import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpSettings } from '@app/core/constants/http-settings.const';
import { Project } from './project';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ProjectService {

  private projectUrl = HttpSettings.API_URL + "/project/";
  constructor(private http: HttpClient) { }

  //Post
  addProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.projectUrl + project.name, project, HttpSettings.HEADER_CONTENT_TYPE_JSON);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(HttpSettings.API_URL + "/projects");
  }

}