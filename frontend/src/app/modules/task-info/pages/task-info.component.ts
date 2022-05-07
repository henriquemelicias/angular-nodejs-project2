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
    setProjectForm: FormGroup;

    constructor( private taskService: TaskService,
                 private route: ActivatedRoute,
                 private modalService: NgbModal,
                 private modal: MdbModalService,
                 private router: Router,
                 private userService: UserService,
                 private projectService: ProjectService,
                 fb: FormBuilder
    ) {
        this._getTaskByIdFromRoute();
        this._ifNoTaskFound();

        this.setUsersForm = fb.group( {
                                          selectedUsers: new FormArray( [] )
                                      } );

        this.setProjectForm = fb.group(
            {
                project: [
                    '', [
                        Validators.required,
                    ]
                ],
            } );

    }

    public get form(): { [key: string]: AbstractControl; } {
        return this.setProjectForm.controls;
    }

    ngOnInit(): void {
    }

    public openSetUsersModal( longContent: any ) {
        this.setUsers().then( _ => {
            this.task.users.forEach( t => this.setUsersForm.controls['selectedUsers'].value.push( t ) );
            this._openModal( longContent );
        } );
    }

    public openSetProjectsModal( longContent: any ) {
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
        this.taskService.updateTask( this.task ).subscribe( task => this.task = task );
        window.location.reload();
    }

    setProjectSubmit() {
        if ( !this.selectedTarget ) return;

        this.selectedProject = this.projects.filter( p => p.acronym === this.selectedTarget )[0];

        const isTaskInProjectAlready = this.selectedProject.tasks.includes( this.task );

        if ( isTaskInProjectAlready )
        {
            this.selectedProject.tasks = this.selectedProject.tasks.filter( t => t !== this.task );
        }
        else {
            this.selectedProject.tasks.push( this.task );
        }

        this.projectService.updateProject( this.selectedProject ).subscribe();
        window.location.reload();
    }

    selectChangeHandler( event: any ) {
        this.selectedTarget = event.target.value;
    }
}
