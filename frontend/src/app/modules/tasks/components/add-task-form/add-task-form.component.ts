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
import { HttpStatusCode } from "@angular/common/http";

@Component( {
                selector: 'app-add-task-form',
                templateUrl: './add-task-form.component.html',
                styleUrls: [ './add-task-form.component.css' ]
            } )
export class AddTaskFormComponent implements OnInit {

    public addTaskForm: FormGroup;
    public showCreate = false;
    public showDelete = false;
    public todayDate: Date;


    selectedPriority: string = TaskPriorityEnum.BAIXA.valueOf();
    username: string = "";
    todayWithPipe = null;

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
            },
            { validators: [ this.dateLessThan( 'startDate', 'endDate' ), this.dateAfterNow( 'startDate', 'endDate' ) ] }
        );

        this.todayDate = new Date();
        this.todayDate.setMinutes( this.todayDate.getMinutes() - this.todayDate.getTimezoneOffset() );

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

    selectChangeHandler( event: any ) {
        this.selectedPriority = event.target.value;
    }

    public onSubmitAddTask(): void {
        const startDateFormValue = this.form['startDate'].value;

        let startDate;
        if ( startDateFormValue ) {
            const startDateTokens = startDateFormValue.split( "-" );
            startDate = new Date(
                parseInt( startDateTokens[0] ),
                parseInt( startDateTokens[1] ),
                parseInt( startDateTokens[2] )
            );
        }


        const endDateFormValue = this.form['endDate'].value;
        let endDate;
        if ( endDateFormValue ) {
            const endDateTokens = endDateFormValue.split( "-" );


            endDate = new Date(
                parseInt( endDateTokens[0] ),
                parseInt( endDateTokens[1] ),
                parseInt( endDateTokens[2] )
            )
        }

        const task = {} as AddTaskOutput;
        task.name = this.form['name'].value;
        task.madeByUser = this.username;
        task.priority = this.form['priority'].value;
        task.startDate = startDate;
        task.endDate = endDate;
        this._addTask( task );
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
                        .serverErrorHandler( () => {

                            if ( errorHandler.error.status === HttpStatusCode.Conflict ) {
                                AlertService.error(
                                    error.message,
                                    { id: 'alert-task-form' },
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

    dateLessThan( from: string, to: string ) {
        return ( group: FormGroup ): { [key: string]: any } => {
            let f = group.controls[from];
            let t = group.controls[to];
            if ( !f.value || !t.value ) return {};
            if ( f.value >= t.value ) {
                return {
                    dates: "Start date should be before end date."
                };
            }
            return {};
        }
    }

    dateAfterNow( from: string, to: string ) {
        return ( group: FormGroup ): { [key: string]: any } => {
            let f = group.controls[from];
            let t = group.controls[to];
            if ( f.value ) {
                if ( new Date( f.value ) < (new Date()) ) {
                    return {
                        dates3: "Dates should be after now."
                    };
                }
            }
            if ( t.value )
            {
                if ( new Date( t.value ) < (new Date()) ) {
                return {
                    dates2: "Dates should be after now."
                };
            }
            }
            return {};
        }
    }
}
