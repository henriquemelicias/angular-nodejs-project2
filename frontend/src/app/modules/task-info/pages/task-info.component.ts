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
import { ChecklistItemSchema } from '@app/data/task/schemas/checklistItem.schema';
import { ChecklistItemService } from '@app/data/task/services/checklist-item.service';

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

    setUsersForm: FormGroup;
    public addChecklistItemForm: FormGroup;

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

        this.addChecklistItemForm= fb.group(
            {
                name: [
                    '', [
                        Validators.required,
                        Validators.minLength( 4 ),
                        Validators.pattern( "[a-zA-Z0-9]*" )
                    ]
                ],
            });


        this._getTaskByIdFromRoute();
        this._ifNoTaskFound();

        this.setUsersForm = fb.group( {
                                          selectedUsers: new FormArray( [] )
                                      } );

    }


    public get form(): { [key: string]: AbstractControl; } {
        return this.addChecklistItemForm.controls;
    }

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - Task-info" );
    }

    public openSetUsersModal( longContent: any ) {
        this.setUsers().then( _ => {
            this.task.users.forEach( t => this.setUsersForm.controls['selectedUsers'].value.push( t ) );
            this._openModal( longContent );
        } );
    }

    public openAddChecklistItemModal( longContent: any ) {
        this.setProjects().then( _ => {
            this._openModal( longContent );
        } );
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
        return this.userService.getUsers().subscribe( users => {
            this.users = users
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
        this.task.users = this.setUsersForm.controls['selectedUsers'].value;
        this.taskService.updateTask( this.task ).subscribe(  );
    }

    addChecklistItemSubmit() {
        var item = {} as ChecklistItemSchema;
        item.name = this.form['name'].value;
        item.isComplete = false;
        this.checklistItemService.addChecklistItem(item).subscribe();
        this.task.checklist.push(item);
        this.taskService.updateTask(this.task).subscribe();
    }

    selectChangeHandler( event: any ) {
        this.selectedTarget = event.target.value;
    }
}