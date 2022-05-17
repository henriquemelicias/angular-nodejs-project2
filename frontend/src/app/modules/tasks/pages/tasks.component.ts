import { Component, OnInit } from '@angular/core';
import { UserService } from "@data/user/services/user.service";
import { Subject, takeUntil } from "rxjs";
import { TaskService } from "@data/task/services/task.service";
import { TaskSchema } from "@data/task/schemas/task.schema";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";
import { LoggerService } from "@core/services/logger/logger.service";
import { Title } from "@angular/platform-browser";

@Component( {
                selector: 'app-tasks',
                templateUrl: './tasks.component.html',
                styleUrls: [ './tasks.component.css' ]
            } )
export class TasksComponent implements OnInit {

    private _ngUnsubscribe$: Subject<void> = new Subject<void>();

    public PAGE_SIZE = TaskService.TASKS_PER_PAGE;

    public tasksObserver$ = TaskService.getTasksByPage$();
    public isLoggedIn = UserService.hasSessionUser();
    public tasksPages?: TaskSchema[][];
    public currentPage = 1;
    public numberOfEntries = 0;
    public isSessionUserAdmin = UserService.isSessionUserAdmin();

    constructor( private offcanvasService: NgbOffcanvas, private taskService: TaskService, private titleService: Title ) {
        this.selectPage( "1" );
    }

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - " + (UserService.isSessionUserAdmin() ? "Tasks" : "My Tasks") );

        TaskService
            .getTasksByPage$()
            .pipe( takeUntil( this._ngUnsubscribe$ ) )
            .subscribe(
                {
                    next: tasks => { this.tasksPages = tasks; },
                    error: ( error: SanitizedErrorInterface ) => {
                        if ( error.hasBeenHandled ) return;

                        const errorHandler = new AppErrorHandler( error );
                        errorHandler
                            .ifErrorHandlers( null, () => {
                                AlertService.alertToApp(
                                    AlertType.Error,
                                    GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                    null,
                                    LoggerService.setCaller( "TasksComponent", "ngOnInit" )
                                );
                            } ).toObservable();
                    }
                }
            );
    }

    getNumberOfTasks(): void {
        this.taskService.getNumberOfTasks()
            .pipe( takeUntil( this._ngUnsubscribe$ ) )
            .subscribe(
                {
                    next: data => this.numberOfEntries = data.numberOfTasks,
                    error: ( error: SanitizedErrorInterface ) => {
                        if ( error.hasBeenHandled ) return;

                        const errorHandler = new AppErrorHandler( error );
                        errorHandler
                            .ifErrorHandlers( null, () => {
                                AlertService.alertToApp(
                                    AlertType.Error,
                                    GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                    null,
                                    LoggerService.setCaller( "TasksComponent", "getNumberOfTasks" )
                                );
                            } ).toObservable();
                    }
                }
            )
    }

    public reload() {
        this.getNumberOfTasks();
        this.taskService.loadTasksByPage( this.currentPage );
    }

    selectPage( page: string ) {
        this.currentPage = parseInt( page, 10 ) || 1;
        this.reload();

    }

    formatInput( input: HTMLInputElement ) {
        input.value = input.value.replace( /[^0-9]/g, '' );
    }

    ngOnDestroy() {
        this._ngUnsubscribe$.next();
        this._ngUnsubscribe$.complete();
    }

    public openOffCanvas( content: any ) {
        this.offcanvasService.open( content, { position: 'end' } );
    }
}
