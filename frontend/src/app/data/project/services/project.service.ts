import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpSettings } from '@core/constants/http-settings.const';
import { ProjectSchema } from '../schemas/project.schema';
import { Observable } from 'rxjs';

export interface AddProjectInput {
    name: string;
    acronym: string;
    startDate: Date;
    endDate?: Date;
}

@Injectable( {
                 providedIn: 'root'
             } )
export class ProjectService {

    private projectUrl = HttpSettings.API_URL + "/projects";

    constructor( private http: HttpClient ) { }

    addProject( project: AddProjectInput ): Observable<ProjectSchema> {
        return this.http.post<ProjectSchema>( this.projectUrl, project, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }

    getProjects(): Observable<ProjectSchema[]> {
        return this.http.get<ProjectSchema[]>( this.projectUrl, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }
}