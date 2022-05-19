import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpSettings } from '@core/constants/http-settings.const';
import { ProjectSchema } from '../schemas/project.schema';
import { BehaviorSubject, Observable } from 'rxjs';
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";
import { LoggerService } from "@core/services/logger/logger.service";

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

    public static PROJECTS_PER_PAGE = 10;

    private static _API_URI = HttpSettings.API_URL + "/projects";

    private static _projectsByPage$ = new BehaviorSubject<ProjectSchema[][] | undefined>( undefined );
    private static _currentProjectsByPage?: ProjectSchema[][];

    constructor( private http: HttpClient ) { }

    public addProject( project: AddProjectInput ): Observable<void> {
        return this.http.post<void>( ProjectService._API_URI, project, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }

    public getProjects(): Observable<ProjectSchema[]> {
        return this.http.get<ProjectSchema[]>( ProjectService._API_URI, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }

    public getAvailableProjects(): Observable<ProjectSchema[]> {
        return this.http.get<ProjectSchema[]>(
            ProjectService._API_URI + "/available",
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    public static getProjectsByPage$(): Observable<ProjectSchema[][] | undefined> {
        return this._projectsByPage$.asObservable();
    }

    public getProjectsByPage( numProjects: Number, numPage: Number ): Observable<ProjectSchema[]> {
        return this.http.get<ProjectSchema[]>(
            ProjectService._API_URI + '/by-pages?numProjects=' + numProjects + '&numPage=' + numPage,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    public getNumberOfProjects(): Observable<{ numberOfProjects: number }> {
        return this.http.get<{ numberOfProjects: number; }>(
            ProjectService._API_URI + '/num-entries',
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    public loadProjectsByPage( numPage: Number ) {
        ProjectService._currentProjectsByPage = ProjectService._projectsByPage$.getValue();
        ProjectService._currentProjectsByPage = ProjectService._currentProjectsByPage ?
                                                ProjectService._currentProjectsByPage : [];

        while ( numPage > ProjectService._currentProjectsByPage.length ) {
            ProjectService._currentProjectsByPage.push( [] );
        }

        const index = Number( numPage ) - 1;

        this.getProjectsByPage( ProjectService.PROJECTS_PER_PAGE, numPage ).subscribe(
            {
                next: projects => {
                    if ( !ProjectService._currentProjectsByPage ) return

                    ProjectService._currentProjectsByPage[index]
                        = projects;
                    ProjectService._projectsByPage$.next(
                        ProjectService._currentProjectsByPage );
                },
                error: ( error: SanitizedErrorInterface ) => {
                    if ( error.hasBeenHandled ) return;

                    const errorHandler = new AppErrorHandler(
                        error );
                    errorHandler
                        .ifErrorHandlers(
                            null,
                            () => {
                                AlertService.alertToApp(
                                    AlertType.Error,
                                    GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR +
                                    error.message,
                                    null,
                                    LoggerService.setCaller(
                                        "ProjectService",
                                        "loadProjectsByPage"
                                    )
                                );
                            }
                        ).toObservable();
                }
            } );
    }

    updateProject( project: ProjectSchema ) {
        return this.http.put<ProjectSchema>(
            ProjectService._API_URI + "/" + project.acronym,
            project,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    getProjectByAcronym( acronym: string ) {
        return this.http.get<ProjectSchema>(
            ProjectService._API_URI + "/" + acronym,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    getProjectsUnfiltered() {
        return this.http.get<ProjectSchema[]>( ProjectService._API_URI + '/unfiltered', HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }
}