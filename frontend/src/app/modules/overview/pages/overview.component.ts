import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { TeamService } from "@data/team/services/team.service";
import { UserService } from "@data/user/services/user.service";
import { Subject } from "rxjs";
import { AuthRolesEnum } from "@data/user/enums/auth-roles.enum";
import { ProjectService } from "@data/project/services/project.service";
import { TaskService } from "@data/task/services/task.service";
import * as shape from 'd3-shape';

interface Link {
    id: string,
    source: string,
    target: string,
    label: string
}

interface Node {
    id: string,
    label: string,
    type: string
}

interface Cluster {
    id: string,
    label: string,
    childNodeIds: string[]
}

@Component( {
                selector: 'app-overview',
                templateUrl: './overview.component.html',
                styleUrls: [ './overview.component.css' ]
            } )
export class OverviewComponent implements OnInit {
    nodes!: Node[];
    links!: Link[];
    clusters!: Cluster[];
    update$: Subject<boolean> = new Subject();
    center$: Subject<boolean> = new Subject();
    zoomToFit$: Subject<boolean> = new Subject();
    shape = shape.curveBundle.beta(1);

    constructor( private titleService: Title, private userService: UserService, private teamService: TeamService, private projectService: ProjectService, private taskService: TaskService  ) {
    }

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - Overview" );
        this.reloadAll();
    }

    updateGraph() {
        this.update$.next(true)
        this.centerGraph();
        this.fitGraph();
        console.log( {nodes: this.nodes, clusters: this.clusters, links: this.links } );
    }

    centerGraph() {
        this.center$.next(true)
    }

    fitGraph() {
        this.zoomToFit$.next(true)
    }

    reloadAll(): void {
        this.nodes = [];
        this.links = [];
        this.clusters = [];
        Promise.allSettled(
            [
                this.reloadUsers(),
                this.reloadTeams(),
                this.reloadProjects(),
                this.reloadTasks()
            ] ).then( _ => this.updateGraph() );

    }

    async reloadUsers(): Promise<void> {
        const usersCluster = { id: 'users', label: 'Users Cluster', childNodeIds: [] } as Cluster;
        return new Promise((resolve, reject) => this.userService.getUsers().subscribe(
            {
                next: users => {
                    users.forEach( ( user ) => {
                        const id = 'user' + user.username;
                        usersCluster.childNodeIds.push( id );
                        this.nodes.push( { id: id, label: user.username, type: user.roles.includes( AuthRolesEnum.ADMIN.valueOf() ) ? 'Admin:' : 'User:' } );

                        user.tasks.forEach( ( task ) => {
                            this.links.push(
                                {
                                    id: user.username + 'ut' + task,
                                    source: id,
                                    target: 'task' + task,
                                    label: 'responsible for'
                                } as Link
                            );
                        } )
                    } )
                    this.clusters.push( usersCluster );
                    resolve();
                },
                error: error => reject( error )
            } ) );
    }

    reloadTeams(): Promise<void> {
        const teamsCluster = { id: 'teams', label: 'Teams Cluster', childNodeIds: [] } as Cluster;
        return new Promise((resolve, reject) => this.teamService.getTeams().subscribe(
            {
                next: teams => {
                    teams.forEach( ( team ) => {
                        const id = 'team' + team._id;
                        teamsCluster.childNodeIds.push( id );
                        this.nodes.push( { id: id, label: team.name, type: 'Team:' } as Node );
                        this.links.push(
                            {
                                id: team._id + 'tp' + team.projectAcronym,
                              source: id,
                              target: 'project' + team.projectAcronym,
                              label: 'works on'
                            } as Link
                        );

                        team.members.forEach( ( member ) => {
                            this.links.push(
                                {
                                    id: team._id + 'tu' + member,
                                    source: id,
                                    target: 'user' + member,
                                    label: 'has member'
                                } as Link
                            );
                        } )
                    } )
                    this.clusters.push( teamsCluster );
                    resolve();
                },
                error: error => reject( error )
            } ) );
    }

    reloadProjects(): Promise<void> {
        const projectsCluster = { id: 'projects', label: 'Projects Cluster', childNodeIds: [] } as Cluster;
        return new Promise((resolve, reject) => this.projectService.getProjects().subscribe(
            {
                next: projects => {
                    projects.forEach( ( project ) => {
                        const id = 'project' + project.acronym;
                        projectsCluster.childNodeIds.push( id );
                        this.nodes.push( { id: id, label: project.acronym + ' - ' + project.name, type: 'Project:' } as Node );

                        project.tasks.forEach( ( task ) => {
                            this.links.push(
                                {
                                    id: project.acronym + 'pt' + task,
                                    source: id,
                                    target: 'task' + task,
                                    label: 'contains'
                                } as Link
                            );
                        } )
                    } )
                    this.clusters.push( projectsCluster );
                    resolve();
                },
                error: error => reject( error )
            } ) );
    }

    reloadTasks(): Promise<void> {
        const tasksCluster = { id: 'tasks', label: 'Tasks Cluster', childNodeIds: [] } as Cluster;
        return new Promise((resolve, reject) => this.taskService.getTasks().subscribe(
            {
                next: tasks => {
                    tasks.forEach( ( task ) => {
                        const id = 'task' + task._id;
                        tasksCluster.childNodeIds.push( id );
                        this.nodes.push( { id: id, label: task.name, type: 'Task:' } as Node );
                    } )
                    this.clusters.push( tasksCluster );
                    resolve()
                },
                error: error => reject( error )
            } ) );
    }
}
