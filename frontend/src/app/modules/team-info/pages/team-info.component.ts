import { Component, OnInit } from '@angular/core';
import { TeamSchema } from "@data/team/schemas/team.schema";
import { UserService } from "@data/user/services/user.service";
import { TaskSchema } from "@data/task/schemas/task.schema";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { ProjectSchema } from "@data/project/schemas/project.schema";
import { ActivatedRoute } from "@angular/router";
import { TeamService } from "@data/team/services/team.service";
import { ProjectService } from "@data/project/services/project.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { Title } from "@angular/platform-browser";

@Component( {
                selector: 'app-team-info',
                templateUrl: './team-info.component.html',
                styleUrls: [ './team-info.component.css' ]
            } )
export class TeamInfoComponent implements OnInit {

    hasTeam: boolean = false;
    team!: TeamSchema;

    isAdmin = UserService.isSessionUserAdmin();

    tasks!: TaskSchema[]

    setProjectsForm: FormGroup
    projects?: ProjectSchema[];

    constructor( private route: ActivatedRoute,
                 private teamService: TeamService,
                 private projectService: ProjectService,
                 fb: FormBuilder,
                 private modalService: NgbModal,
                 private titleService: Title
    ) {
        this._getTeamByNameUrl();
        this._ifNoTeamFound();

        this.setProjectsForm = fb.group( {
                                             selectedProjects: new FormArray( [] )
                                         } );
    }

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - Team-info" );
    }


    private _getTeamByNameUrl() {
        this.teamService.getTeamByName( this.route.snapshot.params['name'] )
            .subscribe(
                {
                    next: team => {
                        this.team = team;
                        this.hasTeam = true;
                    }
                } )
    }

    private _ifNoTeamFound() {
        setTimeout( () => {
            if ( !this.hasTeam ) {
                AlertService.alertToApp( AlertType.Error, "Team not found" );
            }
        }, 1000 );
    }

    private async setProjects() {
        return this.projectService.getProjects().subscribe( projects => {
            this.projects = projects
        } );
    }


    onCheckboxChange( event: any ) {
        const selectedProjects = (this.setProjectsForm.controls['selectedProjects'] as FormArray);
        if ( event.target.checked ) {
            selectedProjects.push( new FormControl( event.target.value ) );
        }
        else {
            const index = selectedProjects.controls
                                          .findIndex( x => x.value === event.target.value );
            selectedProjects.removeAt( index );
        }
    }

    setProjectsSubmit() {
        this.team.project = this.setProjectsForm.controls['selectedProjects'].value;
        this.teamService.updateTeam( this.team ).subscribe();
    }

    public openSetProjectsModal( longContent: any ) {
        this.setProjects().then( _ => {
            (this.setProjectsForm.controls['selectedProjects'] as FormArray).clear();
            this.team.project.forEach( t => {
                (this.setProjectsForm.controls['selectedProjects'] as FormArray).push( new FormControl( t ) )
            } );

            this._openModal( longContent );
        } );
    }

    private _openModal( longContent: any ) {
        this.modalService.open( longContent, { scrollable: true, size: "lg" } );
    }

}
