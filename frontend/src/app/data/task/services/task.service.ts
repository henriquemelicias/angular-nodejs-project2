import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpSettings } from '@app/core/constants/http-settings.const';
import { TaskSchema } from '@data/task/schemas/task.schema.js';
import { BehaviorSubject, Observable } from 'rxjs';
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";
import { LoggerService } from "@core/services/logger/logger.service";

@Injectable( {
                 providedIn: 'root'
             } )
export class TaskService {

    private static _API_URI = HttpSettings.API_URL + "/tasks";

    public static TASKS_PER_PAGE = 10;

    private static _tasksByPage$ = new BehaviorSubject<TaskSchema[][] | undefined>( undefined );
    private static _currentTasksByPage?: TaskSchema[][];

    constructor( private http: HttpClient ) { }

    //Post
    public addTask( task: TaskSchema ): Observable<void> {
        return this.http.post<void>( TaskService._API_URI, task, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }

    //Delete
    public deleteTask( id: string ): Observable<TaskSchema> {
        return this.http.delete<TaskSchema>( TaskService._API_URI + "/" + id, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }

    //Get
    public getTask( id: string ): Observable<TaskSchema> {
        return this.http.get<TaskSchema>( TaskService._API_URI + "/" + id, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }

    public getTasks(): Observable<TaskSchema[]> {
        return this.http.get<TaskSchema[]>( TaskService._API_URI, HttpSettings.HEADER_CONTENT_TYPE_JSON );
    }

    public updateTask( task: TaskSchema ): Observable<void> {
        return this.http.put<void>(
            TaskService._API_URI + "/" + task._id,
            task,
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    public static getTasksByPage$(): Observable<TaskSchema[][] | undefined> {
        return this._tasksByPage$;
    }

    public getTasksByPage( numTasks: Number, numPage: Number ): Observable<TaskSchema[]> {
        return this.http.get <TaskSchema[]>(
            TaskService._API_URI + '/by-page?numTasks=' + numTasks + "&numPage=" +
            numPage, HttpSettings.HEADER_CONTENT_TYPE_JSON
        )
    }

    public getNumberOfTasks(): Observable<{ numberOfTasks: number }> {
        return this.http.get<{ numberOfTasks: number; }>(
            TaskService._API_URI + '/num-entries',
            HttpSettings.HEADER_CONTENT_TYPE_JSON
        );
    }

    public loadTasksByPage( numPage: Number ) {
        TaskService._currentTasksByPage = TaskService._tasksByPage$.getValue();
        TaskService._currentTasksByPage = TaskService._currentTasksByPage ? TaskService._currentTasksByPage : [];

        while ( numPage > TaskService._currentTasksByPage.length ) {
            TaskService._currentTasksByPage.push( [] );
        }

        const index = Number( numPage ) - 1;

        this.getTasksByPage( TaskService.TASKS_PER_PAGE, numPage ).subscribe(
            {
                next: tasks => {
                    if ( !TaskService._currentTasksByPage ) return;

                    TaskService._currentTasksByPage[index] = tasks;
                    TaskService._tasksByPage$.next( TaskService._currentTasksByPage );
                },
                error: ( error: SanitizedErrorInterface ) => {
                    if ( error.hasBeenHandled ) return;

                    const errorHandler = new AppErrorHandler( error );
                    errorHandler
                        .ifErrorHandlers( null, () => {
                            AlertService.alertToApp(
                                AlertType.Error,
                                GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                null,
                                LoggerService.setCaller( "taskService", "loadTasksByPage" )
                            );
                        } ).toObservable();
                }
            } );
    }

}
