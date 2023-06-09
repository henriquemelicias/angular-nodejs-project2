import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { AddProjectInput, ProjectService } from "@data/project/services/project.service";
import { LocalStorageKeyEnum } from "@core/enums/local-storage-key.enum";
import { AlertService } from "@core/services/alert/alert.service";
import { LoggerService } from "@core/services/logger/logger.service";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { HttpStatusCode } from "@angular/common/http";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";

@Component( {
                selector: 'app-add-project-form',
                templateUrl: './add-project-form.component.html',
                styleUrls: [ './add-project-form.component.css' ]
            } )
export class AddProjectFormComponent implements OnInit {

    public projectForm: FormGroup;

    todayDate = new Date();
    datePlusOneDay = new Date().setDate( this.todayDate.getDate() + 1 );

    constructor( private formBuilder: FormBuilder,
                 private projectService: ProjectService ) {

        const savedFormValue = JSON.parse( localStorage.getItem( LocalStorageKeyEnum.PROJECT_FORM )! );

        // Initial form and validators.
        this.projectForm = formBuilder.group(
            {
                name: [
                    savedFormValue && savedFormValue.name || '', [
                        Validators.required,
                        Validators.minLength( 4 ),
                        Validators.maxLength( 50 ),
                        Validators.pattern( "[a-zA-Z0-9]*" )
                    ]
                ],
                acronym: [
                    savedFormValue && savedFormValue.acronym || '', [
                        Validators.required,
                        Validators.minLength( 3 ),
                        Validators.maxLength( 3 ),
                        Validators.pattern( "[a-zA-Z0-9]*" )
                    ]
                ],
                startDate: [
                    savedFormValue && savedFormValue.startDate || '', [
                        Validators.required,
                    ]
                ],
                endDate: [
                    '', []
                ]
            }, {validators: this.dateLessThan( 'startDate', 'endDate' ) } );

        this.projectForm.valueChanges.subscribe( value => {
            localStorage.setItem(
                LocalStorageKeyEnum.PROJECT_FORM, JSON.stringify(
                    {
                        name: value.name,
                        acronym: value.acronym,
                        startDate: value.startDate,
                    } ) );
        } );
    }

    ngOnInit(): void { }

    public get form(): { [key: string]: AbstractControl; } {
        return this.projectForm.controls;
    }

    public onSubmit(): void {
        const startDateTokens = this.form['startDate'].value.split( "-" );


        const startDate = new Date(
            parseInt( startDateTokens[0] ),
            parseInt( startDateTokens[1] ),
            parseInt( startDateTokens[2] )
        );

        let endDate;
        const endDateFormValue = this.form['endDate'].value;

        if ( endDateFormValue ) {
            const endDateTokens = endDateFormValue.split( "-" );
            endDate = new Date(
                parseInt( endDateTokens[0] ),
                parseInt( endDateTokens[1] ),
                parseInt( endDateTokens[2] )
            )
        }

        const project = {} as AddProjectInput;
        project.name = this.form['name'].value;
        project.acronym = this.form['acronym'].value.toUpperCase();
        project.startDate = startDate;
        project.endDate = endDate;

        this._addProject( project );
    }

    private _addProject( projectInput: AddProjectInput ) {

        const logCallers = LoggerService.setCaller( this, this._addProject );
        LoggerService.info( "HTTP add project request sent with: " + JSON.stringify( projectInput ), logCallers );

        this.projectService.addProject( projectInput ).subscribe(
            {
                next: _ => {
                    this.projectForm.reset();
                    AlertService.success(
                        `Project ${ projectInput.name } created successfully`,
                        { id: "alert-project-form", isAutoClosed: true },
                        logCallers
                    );
                },
                error: ( error: SanitizedErrorInterface ) => {
                    if ( error.hasBeenHandled ) return;

                    const errorHandler = new AppErrorHandler( error );
                    errorHandler
                        .serverErrorHandler( () => {

                            if ( errorHandler.error.status === HttpStatusCode.Conflict ) {
                                AlertService.warn(
                                    error.message,
                                    { id: 'alert-project-form' },
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

    optionalValidator(validators?: (ValidatorFn | null | undefined)[]): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {

            // @ts-ignore
            return control.value ? Validators.compose(validators)(control) : null;
        };
    }

    dateLessThan( from: string, to: string ) {
        return ( group: FormGroup ): { [key: string]: any } => {
            let f = group.controls[from];
            let t = group.controls[to];
            if ( !f.value ) return {};
            if ( f.value && !t.value ) return {};
            if ( f.value >= t.value ) {
                return {
                    dates: "Start date should be before end date."
                };
            }
            return {};
        }
    }
}
