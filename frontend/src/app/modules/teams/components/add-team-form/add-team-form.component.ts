import { Component, OnInit } from '@angular/core';
import { TeamService } from '@data/team/services/team.service';
import { AlertService } from "@core/services/alert/alert.service";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { HttpStatusCode } from "@angular/common/http";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AddProjectInput } from "@data/project/services/project.service";
import { LoggerService } from "@core/services/logger/logger.service";

@Component( {
                selector: 'app-add-team-form',
                templateUrl: './add-team-form.component.html',
                styleUrls: [ './add-team-form.component.css' ]
            } )
export class AddTeamFormComponent implements OnInit {

    public teamForm: FormGroup;

    constructor( private formBuilder: FormBuilder,
                 private teamService: TeamService ) {


        this.teamForm = formBuilder.group(
            {
                name: [
                    '', [
                        Validators.required,
                        Validators.minLength( 4 ),
                        Validators.maxLength( 50 ),
                        Validators.pattern( "[a-zA-Z0-9]*" )
                    ]
                ]
        } );
    }

    ngOnInit(): void {}

    public get form(): { [key: string]: AbstractControl; } {
        return this.teamForm.controls;
    }

    public onSubmit(): void {

        const teamName = this.form['name'].value;
        this._addTeam( teamName );
    }

    private _addTeam( teamName: string ): void {
        const logCallers = LoggerService.setCaller( this, this._addTeam );

        this.teamService.addTeam( teamName ).subscribe(
            {
                next: _ => {
                    this.teamForm.reset();
                    AlertService.success(
                        `Team ${ teamName } created successfully`,
                        { id: "alert-team-form", isAutoClosed: true },
                        logCallers
                    );
                },
                error: ( error: SanitizedErrorInterface ) => {
                    if ( error.hasBeenHandled ) return;

                    const errorHandler = new AppErrorHandler( error );
                    errorHandler
                        .serverErrorHandler( () => {

                            if ( errorHandler.error.status === HttpStatusCode.Conflict ) {
                                AlertService.error(
                                    error.message,
                                    { id: 'alert-team-form' },
                                    logCallers
                                );
                                errorHandler.hasBeenHandled = true;
                            }
                        } )
                        .ifErrorHandlers( null, () => {
                            AlertService.alertToApp(
                                AlertType.Error,
                                GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                null,
                                logCallers
                            );
                        } ).toObservable();
                }
            } );
    }
}
