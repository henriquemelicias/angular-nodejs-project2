import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AddProjectInput, ProjectService } from "@data/project/services/project.service";
import { LocalStorageKeyEnum } from "@core/enums/local-storage-key.enum";
import { AlertService } from "@core/services/alert/alert.service";
import { LoggerService } from "@core/services/logger/logger.service";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { HttpStatusCode } from "@angular/common/http";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";

@Component({
  selector: 'app-add-project-form',
  templateUrl: './add-project-form.component.html',
  styleUrls: ['./add-project-form.component.css']
})
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
        } );

    this.form['startDate'].valueChanges.subscribe( _ => {
      if ( this.form['endDate'].value !== "" )
      {
        this.form['endDate'].reset();
        AlertService.warn(
            `Please select a new end date`,
            { id: "alert-project-form", isAutoClosed: true }
        );
      }
    } );

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
    console.log( this.form["startDate"].value );

    const startDateTokens = this.form['startDate'].value.split( "-" );
    const endDateTokens = this.form['endDate'].value.split( "-" );

    const startDate = new Date(
        parseInt( startDateTokens[0] ),
        parseInt( startDateTokens[1] ),
        parseInt( startDateTokens[2] )
    );
    const endDate = new Date(
        parseInt( endDateTokens[0] ),
        parseInt( endDateTokens[1] ),
        parseInt( endDateTokens[2] )
    )

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
                    AlertService.error(
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
}
