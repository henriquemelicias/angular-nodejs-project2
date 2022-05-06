import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from "@data/user/services/user.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { TeamSchema } from "@data/team/schemas/team.schema";

import { Subject, takeUntil } from "rxjs";
import { TeamService } from "@data/team/services/team.service";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";
import { LoggerService } from "@core/services/logger/logger.service";


@Component( {
                selector: 'app-teams',
                templateUrl: './teams.component.html',
                styleUrls: [ './teams.component.css' ]
            } )
export class TeamsComponent implements OnInit, OnDestroy {

    private _ngUnsubscribe$: Subject<void> = new Subject<void>();

    public isSessionUserAdmin = UserService.isSessionUserAdmin();
    public teams?: TeamSchema[][];
    public currentPage = 1;

    constructor( private offcanvasService: NgbOffcanvas, private teamService: TeamService ) { }

    ngOnInit(): void {
        TeamService
            .getTeams$()
            .pipe( takeUntil( this._ngUnsubscribe$ ) )
            .subscribe(
                {
                    next: teams => this.teams = teams,
                    error: ( error: SanitizedErrorInterface ) => {
                        if ( error.hasBeenHandled ) return;

                        const errorHandler = new AppErrorHandler( error );
                        errorHandler
                            .ifErrorHandlers( null, () => {
                                AlertService.alertToApp(
                                    AlertType.Error,
                                    GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                    null,
                                    LoggerService.setCaller( "TeamsComponent", "ngOnInit" )
                                );
                            } ).toObservable();
                    }
                }
            );

        this.teamService.loadTeams$( this.currentPage );
    }

    ngOnDestroy() {
        this._ngUnsubscribe$.next();
        this._ngUnsubscribe$.complete();
    }

    public openOffCanvas( content: any ) {
        this.offcanvasService.open( content, { position: 'end' } );
    }
}
