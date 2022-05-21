import { Component, OnInit } from '@angular/core';
import { TaskService } from "@data/task/services/task.service";
import { ActivatedRoute, Router } from "@angular/router";
import { TaskSchema } from "@data/task/schemas/task.schema";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalComponent } from "@shared/components/modal/modal.component";
import { MdbModalRef, MdbModalService } from "mdb-angular-ui-kit/modal";
import { UserService } from "@data/user/services/user.service";
import { UserSchema } from "@data/user/schemas/user.schema";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ProjectSchema } from "@data/project/schemas/project.schema";
import { ProjectService } from "@data/project/services/project.service";
import { Title } from "@angular/platform-browser";
import { ChecklistItemSchema } from '@data/task/schemas/checklist-item.schema';
import { ChecklistItemService } from '@app/data/task/services/checklist-item.service';
import { LoggerService } from "@core/services/logger/logger.service";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { HttpStatusCode } from "@angular/common/http";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";

@Component( {
                selector: 'app-task-info',
                templateUrl: './task-info.component.html',
                styleUrls: [ './task-info.component.css' ]
            } )
export class TaskInfoComponent implements OnInit {

    hasTask: boolean = false;
    task!: TaskSchema;
    modalRef: MdbModalRef<ModalComponent> | null = null; // set task modal

    users!: UserSchema[];
    projects!: ProjectSchema[];
    selectedProject?: ProjectSchema;
    selectedTarget!: String;

    public todayDate: Date;
    changeDateForm: FormGroup;
    setUsersForm: FormGroup;
    updatePercentageForm: FormGroup;
    addChecklistItemForm: FormGroup;

    constructor( private taskService: TaskService,
                 private route: ActivatedRoute,
                 private modalService: NgbModal,
                 private modal: MdbModalService,
                 private router: Router,
                 private userService: UserService,
                 private projectService: ProjectService,
                 fb: FormBuilder,
                 private titleService: Title,
                 private checklistItemService: ChecklistItemService
    ) {

        this.updatePercentageForm = fb.group(
            {
                percentage: [
                    '', [
                        Validators.required,
                        Validators.pattern( "[0-9]*" ),
                        Validators.maxLength( 3 )
                    ]
                ]
            },
            { validators: [ this.percentageBetween( 'percentage' ) ] }
        );

        this.changeDateForm = fb.group(
            {
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

        this.addChecklistItemForm = fb.group(
            {
                name: [
                    '', [
                        Validators.required,
                        Validators.minLength( 4 ),
                        Validators.pattern( "[a-zA-Z0-9]*" )
                    ]
                ],
            } );


        this._getTaskByIdFromRoute();
        this._ifNoTaskFound();

        this.setUsersForm = fb.group( {
                                          selectedUsers: new FormArray( [] )
                                      } );

    }


    public get form(): { [key: string]: AbstractControl; } {
        return this.addChecklistItemForm.controls;
    }

    public get form2(): { [key: string]: AbstractControl; } {
        return this.changeDateForm.controls;
    }

    public get form3(): { [key: string]: AbstractControl; } {
        return this.updatePercentageForm.controls;
    }

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - Task-info" );
    }

    public openSetUsersModal( longContent: any ) {
        const selectedUsers = (this.setUsersForm.controls['selectedUsers'] as FormArray);
        selectedUsers.clear();
        this.setUsers().then( _ => {
            this.task.users.forEach( t => selectedUsers.push( new FormControl( t ) ) );
            this._openModal( longContent );
        } );
    }

    public openAddChecklistItemModal( longContent: any ) {
        this._openModal( longContent );
    }

    public openChangeDateModal( longContent: any ) {
        this._openModal( longContent );
    }

    public openChangePercentageModal( longContent: any ) {
        this._openModal( longContent );
    }

    private _openModal( longContent: any ) {
        this.modalService.open( longContent, { scrollable: true, size: "lg" } );
    }

    private _getTaskByIdFromRoute() {
        this.taskService.getTask( this.route.snapshot.params['_id'] )
            .subscribe(
                {
                    next: task => {
                        this.task = task;
                        this.hasTask = true;
                    }
                } )
    }

    private _ifNoTaskFound() {
        setTimeout( () => {
            if ( !this.hasTask ) {
                AlertService.alertToApp( AlertType.Error, "Task not found" );
            }
        }, 1000 );
    }

    openModalSimple() {
        this.modalRef = this.modal.open(
            ModalComponent,
            { data: { title: 'Remove task', content: 'Do you want to remove this task?' } }
        );
        this.modalRef.onClose.subscribe( ( message: any ) => {
            if ( message && message.isRightButtonSelected ) {
                this.taskService.deleteTask( this.task._id )
                    .subscribe(
                        { next: () => this.router.navigateByUrl( "/tasks" ) } );
            }
        } );
    };

    private async setUsers() {
        return new Promise( ( resolve, reject ) => {
            this.userService.getUsersSameProject( this.task._id, this.task.name ).subscribe(
                users => {
                    this.users = users;
                    resolve( true );
                },
                error => reject( error )
            );
        } );
    }

    private async setProjects() {
        return this.projectService.getProjects().subscribe( projects => {
            this.projects = projects
        } );
    }


    onCheckboxChange( event: any ) {
        const selectedUsers = (this.setUsersForm.controls['selectedUsers'] as FormArray);
        if ( event.target.checked ) {
            selectedUsers.push( new FormControl( event.target.value ) );
        }
        else {
            const index = selectedUsers.controls
                                       .findIndex( x => x.value === event.target.value );
            selectedUsers.removeAt( index );
        }
    }

    setUsersSubmit() {
        let task = {
            ...this.task,
            users: this.setUsersForm.controls['selectedUsers'].value
        };

        this.modifyTask( task );
    }

    changeDateSubmit() {
        const startDateFormValue = this.form2['startDate'].value;

        let startDate;
        if ( startDateFormValue ) {
            const startDateTokens = startDateFormValue.split( /[-T:]/ );
            startDate = new Date(
                parseInt( startDateTokens[0] ),
                parseInt( startDateTokens[1] ),
                parseInt( startDateTokens[2] ),
                parseInt( startDateTokens[3] ),
                parseInt( startDateTokens[4] )
            );
        }

        const endDateFormValue = this.form2['endDate'].value;
        let endDate;
        if ( endDateFormValue ) {
            const endDateTokens = endDateFormValue.split( /[-T:]/ );

            endDate = new Date(
                parseInt( endDateTokens[0] ),
                parseInt( endDateTokens[1] ),
                parseInt( endDateTokens[2] ),
                parseInt( endDateTokens[3] ),
                parseInt( endDateTokens[4] )
            );
        }

        let task = {
            ...this.task,
            startDate: startDate,
            endDate: endDate,
        };

        this.modifyTask( task );
    }

    public modifyTask( task: TaskSchema ): void {
        const logCallers = LoggerService.setCaller( this, this.modifyTask );

        this.taskService.updateTask( task ).subscribe(
            {
                next: _ => {
                    this.changeDateForm.reset();
                    this.task.startDate = task.startDate;
                    this.task.endDate = task.endDate;
                    this.task.users = task.users;
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
                                AlertService.alertToApp(
                                    AlertType.Warning,
                                    error.message,
                                    { isCloseable: true },
                                    logCallers
                                );
                                errorHandler.hasBeenHandled = true;
                            }
                        } )
                        .ifErrorHandlers( null, () => {
                            AlertService.alertToApp(
                                AlertType.Error,
                                GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                { isCloseable: true },
                                logCallers
                            );
                        } ).toObservable();
                }
            } );
    }

    addChecklistItemSubmit() {
        if ( this.task.checklist.filter( c => !c.isComplete ).length < 7 ) {
            const item = {} as ChecklistItemSchema;
            item.name = this.form['name'].value;
            item.isComplete = false;
            this.checklistItemService.addChecklistItem( item ).subscribe();
            this.task.checklist.push( item );
            this.taskService.updateTask( this.task ).subscribe();
        }
        else {
            AlertService.alertToApp(
                AlertType.Warning,
                "Each checklist can only contain at most seven to-complete subtasks"
            );
        }
    }

    updatePercentageSubmit() {
        this.task.percentage = parseInt( this.form3['percentage'].value );
        this.taskService.updateTask( this.task ).subscribe();
    }

    selectChangeHandler( event: any ) {
        this.selectedTarget = event.target.value;
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
            if ( t.value ) {
                if ( new Date( t.value ) < (new Date()) ) {
                    return {
                        dates2: "Dates should be after now."
                    };
                }
            }
            return {};
        }
    }

    percentageBetween( percentage: string ) {
        return ( group: FormGroup ): { [key: string]: any } => {
            let f = group.controls[percentage];
            if ( f.value ) {
                if ( parseInt( f.value ) < 0 || parseInt( f.value ) > 100 ) {
                    return {
                        between: "Percentage should be between 0% and 100%"
                    }
                }
            }
            return {}
        }
    }

    beautifyTaskChecklistWowSoPretty( checklist: ChecklistItemSchema[] ) {
        return checklist.flatMap( c => " " + c.name + ((c.isComplete) ? '✓' : "") )
    }

    onChecklistChange( event: any, check: ChecklistItemSchema ): boolean {
        if ( this.task.checklist.filter( c => !c.isComplete ).length < 7 || !check.isComplete ) {
            check.isComplete = !check.isComplete;
            this.modifyTask( this.task );
            return check.isComplete;
        }
        else {
            const url = this.router.url;
            this.router.navigateByUrl( '/', { skipLocationChange: true } ).then( () => {
                this.router.navigateByUrl( url ).then(
                    () => {
                        AlertService.alertToApp(
                            AlertType.Warning,
                            "Each checklist can only contain at most seven to-complete subtasks"
                        );
                    } )
            } );
            return check.isComplete;
        }
    }
}