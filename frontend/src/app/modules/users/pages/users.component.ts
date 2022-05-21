import { Component, OnInit } from '@angular/core';
import { UserService } from "@data/user/services/user.service";
import { Subject, takeUntil } from "rxjs";
import { TaskService } from "@data/task/services/task.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";
import { LoggerService } from "@core/services/logger/logger.service";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { UserSchema } from "@data/user/schemas/user.schema";

@Component( {
                selector: 'app-tasks',
                templateUrl: './users.component.html',
                styleUrls: [ './users.component.css' ]
            } )
export class UsersComponent implements OnInit {

    private _ngUnsubscribe$: Subject<void> = new Subject<void>();

    public PAGE_SIZE = TaskService.TASKS_PER_PAGE;

    public usersObserver$ = UserService.getUsersByPage$();
    public isLoggedIn = UserService.hasSessionUser();
    public usersPages?: UserSchema[][];
    public currentPage = 1;
    public numberOfEntries = 0;
    public isSessionUserAdmin = UserService.isSessionUserAdmin();
    public sessionUser = UserService.sessionUser

    constructor( private offcanvasService: NgbOffcanvas, private userService: UserService, private titleService: Title, private router: Router ) {
        this.selectPage( "1" );
    }

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - Users" );

        UserService
            .getUsersByPage$()
            .pipe( takeUntil( this._ngUnsubscribe$ ) )
            .subscribe(
                {
                    next: users => { this.usersPages = users; },
                    error: ( error: SanitizedErrorInterface ) => {
                        if ( error.hasBeenHandled ) return;

                        const errorHandler = new AppErrorHandler( error );
                        errorHandler
                            .ifErrorHandlers( null, () => {
                                AlertService.alertToApp(
                                    AlertType.Error,
                                    GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                    null,
                                    LoggerService.setCaller( "UsersComponent", "ngOnInit" )
                                );
                            } ).toObservable();
                    }
                }
            );
    }

    getNumberOfUsers(): void {
        this.userService.getNumberOfUsers()
            .pipe( takeUntil( this._ngUnsubscribe$ ) )
            .subscribe(
                {
                    next: data => this.numberOfEntries = data.numberOfUsers,
                    error: ( error: SanitizedErrorInterface ) => {
                        if ( error.hasBeenHandled ) return;

                        const errorHandler = new AppErrorHandler( error );
                        errorHandler
                            .ifErrorHandlers( null, () => {
                                AlertService.alertToApp(
                                    AlertType.Error,
                                    GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                    null,
                                    LoggerService.setCaller( "UsersComponent", "getNumberOfTasks" )
                                );
                            } ).toObservable();
                    }
                }
            )
    }

    public reload() {
        this.getNumberOfUsers();
        this.userService.loadUsersByPage( this.currentPage );
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
