import { Component, OnInit } from '@angular/core';
import { UserService } from "@data/user/services/user.service";
import { Subject, takeUntil } from "rxjs";
import { ProjectService } from "@data/project/services/project.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";
import { LoggerService } from "@core/services/logger/logger.service";
import { ProjectSchema } from "@data/project/schemas/project.schema";
import { Title } from "@angular/platform-browser";


@Component( {
                selector: 'app-projects',
                templateUrl: './projects.component.html',
                styleUrls: [ './projects.component.css' ]
            } )


export class ProjectsComponent implements OnInit {

    isCurrentUserAdmin = UserService.hasSessionUser();

    private _ngUnsubscribe$: Subject<void> = new Subject<void>();

    public PAGE_SIZE = ProjectService.PROJECTS_PER_PAGE;

    public projectsObserver$ = ProjectService.getProjectsByPage$();
    public isSessionUserAdmin = UserService.isSessionUserAdmin();
    public projectsPages?: ProjectSchema[][];
    public currentPage = 1;
    public numberOfEntries = 0;

    constructor( private offcanvasService: NgbOffcanvas, private projectService: ProjectService, private titleService: Title ) {
        this.selectPage( "1" );
    }

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - " + (this.isSessionUserAdmin ? "Projects" : "My Projects") );

        ProjectService
            .getProjectsByPage$()
            .pipe( takeUntil( this._ngUnsubscribe$ ) )
            .subscribe(
                {
                    next: projects => { this.projectsPages = projects; },
                    error: ( error: SanitizedErrorInterface ) => {
                        if ( error.hasBeenHandled ) return;

                        const errorHandler = new AppErrorHandler( error );
                        errorHandler
                            .ifErrorHandlers( null, () => {
                                AlertService.alertToApp(
                                    AlertType.Error,
                                    GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                    null,
                                    LoggerService.setCaller( "ProjectsComponent", "ngOnInit" )
                                );
                            } ).toObservable();
                    }
                }
            );
    }

    getNumberOfProjects(): void {
        this.projectService.getNumberOfProjects()
            .pipe( takeUntil( this._ngUnsubscribe$ ) )
            .subscribe(
                {
                    next: data => this.numberOfEntries = data.numberOfProjects,
                    error: ( error: SanitizedErrorInterface ) => {
                        if ( error.hasBeenHandled ) return;

                        const errorHandler = new AppErrorHandler( error );
                        errorHandler
                            .ifErrorHandlers( null, () => {
                                AlertService.alertToApp(
                                    AlertType.Error,
                                    GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                    null,
                                    LoggerService.setCaller( "ProjectsComponent", "getNumberOfProjects" )
                                );
                            } ).toObservable();
                    }
                }
            )
    }

    public reload() {
        this.getNumberOfProjects();
        this.projectService.loadProjectsByPage( this.currentPage );
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
