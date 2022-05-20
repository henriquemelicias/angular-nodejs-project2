import { Component, OnInit } from '@angular/core';
import { ProjectService } from '@data/project/services/project.service'
import { ProjectSchema } from '@data/project/schemas/project.schema';
import { ActivatedRoute } from "@angular/router";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { TaskService } from "@data/task/services/task.service";
import { TaskSchema } from "@data/task/schemas/task.schema";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Title } from "@angular/platform-browser";


@Component( {
                selector: 'app-projects-info',
                templateUrl: './project-info.component.html',
                styleUrls: [ './project-info.component.css' ]
            } )


export class ProjectInfoComponent implements OnInit {

    hasProject: boolean = false;
    project!: ProjectSchema;

    tasks!: TaskSchema[];
    setTasksForm: FormGroup

    constructor( private route: ActivatedRoute,
                 private projectService: ProjectService,
                 private taskService: TaskService,
                 fb: FormBuilder,
                 private modalService: NgbModal,
                 private titleService: Title,
    ) {
        this._getProjectByAcronymRoute();
        this._ifNoProjectFound();

        this.setTasksForm = fb.group( {
                                          selectedTasks: new FormArray( [] )
                                      } );
    }

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - Project-info" );
    }


    private _getProjectByAcronymRoute() {
        this.projectService.getProjectByAcronym( this.route.snapshot.params['acronym'] )
            .subscribe(
                {
                    next: project => {
                        this.project = project;
                        this.hasProject = true;
                    }
                } )
    }

    private _ifNoProjectFound() {
        setTimeout( () => {
            if ( !this.hasProject ) {
                AlertService.alertToApp( AlertType.Error, "Project not found" );
            }
        }, 1000 );
    }

    private async setTasks() {
        return new Promise( (resolve, reject) => {
            this.taskService.getTasks().subscribe(
                tasks => {
                    this.tasks = tasks;
                    resolve( true );
                },
                error => reject( error )
            );
        } );
    }


    onCheckboxChange( event: any ) {
        const selectedTasks = (this.setTasksForm.controls['selectedTasks'] as FormArray);
        if ( event.target.checked ) {
            selectedTasks.push( new FormControl( event.target.value ) );
        }
        else {
            const index = selectedTasks.controls
                                       .findIndex( x => x.value === event.target.value );
            selectedTasks.removeAt( index );
        }
    }

    setTasksSubmit() {
        this.project.tasks = (this.setTasksForm.controls['selectedTasks'].value as string[]).map( i => { // @ts-ignore
            return { _id: i, name: this.tasks.find( t => t._id === i ).name }
        } );
        this.projectService.updateProject( this.project ).subscribe();
    }

    public openSetTasksModal( longContent: any ) {
        const selectedTasks = (this.setTasksForm.controls['selectedTasks'] as FormArray);
        selectedTasks.clear();
        this.setTasks().then( _ => {
            this.project.tasks.forEach( t => {
                selectedTasks.push( new FormControl( t._id ) );
            } );
            this._openModal( longContent );
        } );
    }

    private _openModal( longContent: any ) {
        this.modalService.open( longContent, { scrollable: true, size: "lg" } );
    }

    projectTasksIncludesTask( tasks: { _id: string; name: string }[], task: TaskSchema ) {
        return tasks.flatMap( t => t._id ).includes( task._id );
    }

    beautifyTasksSoPrettyWow( tasks: { _id: string; name: string }[] ) {
        return tasks.map( t => t.name );
    }
}
