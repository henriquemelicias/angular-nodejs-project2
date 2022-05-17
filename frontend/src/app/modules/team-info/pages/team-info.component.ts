import { Component, OnInit } from '@angular/core';
import { TeamSchema } from "@data/team/schemas/team.schema";
import { UserService } from "@data/user/services/user.service";
import { TaskSchema } from "@data/task/schemas/task.schema";
import { FormBuilder, FormGroup } from "@angular/forms";
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

    REMOVE_PROJECT = "Remove current project";

    hasTeam: boolean = false;
    team!: TeamSchema;

    isAdmin = UserService.isSessionUserAdmin();

    tasks!: TaskSchema[]

    setProjectForm: FormGroup
    projects?: ProjectSchema[];
    selectedProject?: string | null;

    constructor( private route: ActivatedRoute,
                 private teamService: TeamService,
                 private projectService: ProjectService,
                 fb: FormBuilder,
                 private modalService: NgbModal,
                 private titleService: Title
    ) {
        this._getTeamByNameUrl();
        this._ifNoTeamFound();

        this.setProjectForm = fb.group( {
                                            projects: []
                                        } );
    }

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - Team " + this.route.snapshot.params['name'] );
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
        return this.projectService.getAvailableProjects().subscribe( projects => {
            this.projects = projects;
            if ( this.team.projectAcronym ) {
                this.projects.push( {
                                        acronym: this.REMOVE_PROJECT,
                                        name: this.team.projectAcronym
                                    } as ProjectSchema );
            }
            this.projects.reverse();
        } );
    }


    onRadioClick( event: any ) {
        if ( event.target.checked && this.selectedProject === event.target.value ) {
            this.selectedProject = undefined;
            event.target.checked = false;
        }
        else if ( event.target.checked ) {
            this.selectedProject = event.target.value;
        }
    }

    setProjectSubmit() {
        if ( this.selectedProject === this.REMOVE_PROJECT ) {
            this.team.projectAcronym = null;
        }
        else {
            this.team.projectAcronym = this.selectedProject;
        }
        this.teamService.updateTeam( this.team ).subscribe();
    }

    public async openSetProjectsModal( longContent: any ) {
        await this.setProjects().then( _ => {
            this.selectedProject = this.team.projectAcronym;
        } );

        this._openModal( longContent );
    }

    private _openModal( longContent: any ) {
        this.modalService.open( longContent, { scrollable: true, size: "lg" } );
    }

}
