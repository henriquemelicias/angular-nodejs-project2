import { Component, OnInit } from '@angular/core';
import { AddTaskOutput, TaskService } from '@data/task/services/task.service'
import { UserService } from '@app/data/user/services/user.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from 'rxjs';
import { LoggerService } from "@core/services/logger/logger.service";
import { AlertService } from "@core/services/alert/alert.service";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";
import { TaskPriorityEnum } from "@data/task/enums/task-priority.enum";

@Component( {
                selector: 'app-add-task-form',
                templateUrl: './add-task-form.component.html',
                styleUrls: [ './add-task-form.component.css' ]
            } )
export class AddTaskFormComponent implements OnInit {

    public addTaskForm: FormGroup;
    public deleteTaskForm: FormGroup;
    public showCreate = false;
    public showDelete = false;
    todayDate = new Date();
    datePlusOneDay = new Date().setDate( this.todayDate.getDate() + 1 );
    


    selectedPriority: string = TaskPriorityEnum.BAIXA.valueOf();
    username: string = "";

    constructor( private taskService: TaskService, private formBuilder: FormBuilder, ) {

        this.addTaskForm = formBuilder.group(
            {
                name: [
                    '', [
                        Validators.required,
                        Validators.minLength( 4 ),
                        Validators.maxLength( 50 ),
                        Validators.pattern( "[a-zA-Z0-9]*" )
                    ]
                ],
                priority: [
                    '',
                    [
                        Validators.required
                    ]
                ],
                startDate: [
                  '', []
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
                  { id: "alert-task-form", isAutoClosed: true }
              );
            }
          } );
        
        this.deleteTaskForm = formBuilder.group(
            {
                id: [
                    '', [
                        Validators.required,
                    ]
                ],
            } );

        const userPromise = firstValueFrom( UserService.getSessionUser$() );

        userPromise.then( user => {
            if ( user ) {
                this.username = user.username;
            }
        } );
    }

    ngOnInit(): void {
    }

    public get form(): { [key: string]: AbstractControl; } {
        return this.addTaskForm.controls;
    }

    public get form2(): { [key: string]: AbstractControl; } {
        return this.deleteTaskForm.controls;
    }

    selectChangeHandler( event: any ) {
        this.selectedPriority = event.target.value;
    }

    public onSubmitAddTask(): void {
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

        const task = {} as AddTaskOutput;
        task.name = this.form['name'].value;
        task.madeByUser = this.username;
        task.priority = this.form['priority'].value;
        task.startDate = startDate;
        task.endDate = endDate;
        this._addTask( task );
    }

    public onSubmitDeleteTask(): void {
        this._deleteTask( this.form2['id'].value );
    }

    private _addTask( task: AddTaskOutput ): void {
        const logCallers = LoggerService.setCaller( this, this._addTask );

        this.taskService.addTask( task ).subscribe(
            {
                next: _ => {
                    this.addTaskForm.reset();
                    AlertService.success(
                        `Task ${ task.name } created successfully`,
                        { id: "alert-task-form", isAutoClosed: true },
                        logCallers
                    );
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
                                logCallers
                            );
                        } ).toObservable();
                }
            } );
    }

    private _deleteTask( _id: string ) {
        const logCallers = LoggerService.setCaller( this, this._deleteTask );

        this.taskService.deleteTask( _id ).subscribe(
            {
                next: _ => {
                    this.deleteTaskForm.reset();
                    AlertService.success(
                        `Task deleted successfully`,
                        { id: "alert-task-delete-form", isAutoClosed: true },
                        logCallers
                    );
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
                                logCallers
                            );
                        } ).toObservable();
                }
            } );
    }
}
