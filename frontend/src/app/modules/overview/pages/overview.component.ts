import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { TeamService } from "@data/team/services/team.service";
import { UserService } from "@data/user/services/user.service";
import { Subject } from "rxjs";
import { AuthRolesEnum } from "@data/user/enums/auth-roles.enum";
import { ProjectService } from "@data/project/services/project.service";
import { TaskService } from "@data/task/services/task.service";
import * as shape from 'd3-shape';
import { forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { DagreClusterCustomLayout } from "@modules/overview/layout/dagreClusterCustom";

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
    layout = 'dagreCluster';
    layoutSettings = {};
    // layoutSettings = {
    //     force: forceSimulation<any>().force( 'charge', forceManyBody().strength( -400 ) ).force(
    //         'collide',
    //         forceCollide( 5 )
    //     ),
    //     forceLink: forceLink<any, any>()
    //         .id( (node: any) => node.id )
    //         .distance( () => 100 )
    // };
    nodes!: Node[];
    links!: Link[];
    clusters!: Cluster[];
    update$: Subject<boolean> = new Subject();
    center$: Subject<boolean> = new Subject();
    zoomToFit$: Subject<boolean> = new Subject();
    shape = shape.curveMonotoneX;

    constructor( private titleService: Title,
                 private userService: UserService,
                 private teamService: TeamService,
                 private projectService: ProjectService,
                 private taskService: TaskService ) {
    }

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - Overview" );
        this.reloadAll();
    }

    updateGraph() {
        this.update$.next( true )
        this.centerGraph();
        this.fitGraph();
        console.log( { nodes: this.nodes, clusters: this.clusters, links: this.links } );
    }

    centerGraph() {
        this.center$.next( true )
    }

    fitGraph() {
        this.zoomToFit$.next( true )
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
        return new Promise( ( resolve, reject ) => this.userService.getUsers().subscribe(
            {
                next: users => {
                    users.forEach( ( user ) => {
                        const id = 'user' + user.username;
                        usersCluster.childNodeIds.push( id );
                        this.nodes.push( {
                                             id: id,
                                             label: user.username,
                                             type: user.roles.includes( AuthRolesEnum.ADMIN.valueOf() ) ?
                                                   'Admin:' :
                                                   'User:'
                                         } );

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
                    if ( usersCluster.childNodeIds.length > 0 ) this.clusters.push( usersCluster );
                    resolve();
                },
                error: error => reject( error )
            } ) );
    }

    reloadTeams(): Promise<void> {
        const teamsCluster = { id: 'teams', label: 'Teams Cluster', childNodeIds: [] } as Cluster;
        return new Promise( ( resolve, reject ) => this.teamService.getTeams().subscribe(
            {
                next: teams => {
                    teams.forEach( ( team ) => {
                        const id = 'team' + team._id;
                        teamsCluster.childNodeIds.push( id );
                        this.nodes.push( { id: id, label: team.name, type: 'Team:' } as Node );

                        if ( team.projectAcronym )
                        {
                            this.nodes.push( { id: 'tp' + id, label: 'works on', type: '' } );
                            this.links.push(
                                {
                                    id: team._id + 'tp' + team.projectAcronym + '1',
                                    source: id,
                                    target: 'tp' + id,
                                    label: ''
                                }
                            )
                            this.links.push(
                                {
                                    id: team._id + 'tp' + team.projectAcronym + '2',
                                    source: 'tp' + id,
                                    target: 'project' + team.projectAcronym,
                                    label: 'works on'
                                } as Link
                            );
                        }

                        if ( team.members.length > 0 ) {
                            this.nodes.push( { id: 'tm' + id, label: 'has member', type: '' } );
                            this.links.push(
                                {
                                    id: team._id + 'tm',
                                    source: id,
                                    target: 'tm' + id,
                                    label: ''
                                }
                            )
                        }
                        team.members.forEach( ( member ) => {
                            this.links.push(
                                {
                                    id: team._id + 'tu' + member,
                                    source: 'tm' + id,
                                    target: 'user' + member,
                                    label: 'has member'
                                } as Link
                            );
                        } )
                    } )
                    if ( teamsCluster.childNodeIds.length > 0 ) this.clusters.push( teamsCluster );
                    resolve();
                },
                error: error => reject( error )
            } ) );
    }

    reloadProjects(): Promise<void> {
        const projectsCluster = { id: 'projects', label: 'Projects Cluster', childNodeIds: [] } as Cluster;
        return new Promise( ( resolve, reject ) => this.projectService.getProjectsUnfiltered().subscribe(
            {
                next: projects => {
                    projects.forEach( ( project ) => {
                        const id = 'project' + project.acronym;
                        projectsCluster.childNodeIds.push( id );
                        this.nodes.push( {
                                             id: id,
                                             label: project.acronym + ' - ' + project.name,
                                             type: 'Project:'
                                         } as Node );

                        if ( project.tasks.length > 0 ) {
                            this.nodes.push( { id: 'pt' + id, label: 'contains', type: '' } );
                            this.links.push(
                                {
                                    id: project.acronym + 'pt',
                                    source: id,
                                    target: 'pt' + id,
                                    label: ''
                                }
                            )
                        }
                        project.tasks.forEach( ( task ) => {
                            this.links.push(
                                {
                                    id: project.acronym + 'pt' + task._id,
                                    source: 'pt' + id,
                                    target: 'task' + task._id,
                                    label: 'contains'
                                } as Link
                            );
                        } )
                    } )
                    if ( projectsCluster.childNodeIds.length > 0 ) this.clusters.push( projectsCluster );
                    resolve();
                },
                error: error => reject( error )
            } ) );
    }

    reloadTasks(): Promise<void> {
        const tasksCluster = { id: 'tasks', label: 'Tasks Cluster', childNodeIds: [] } as Cluster;
        return new Promise( ( resolve, reject ) => this.taskService.getTasksUnfiltered().subscribe(
            {
                next: tasks => {
                    tasks.forEach( ( task ) => {
                        const id = 'task' + task._id;
                        tasksCluster.childNodeIds.push( id );
                        this.nodes.push( { id: id, label: task.name, type: 'Task:' } as Node );

                        if ( task.users.length > 0 ) {
                            this.nodes.push( { id: 'tu' + id, label: 'assigned to', type: '' } );
                            this.links.push(
                                {
                                    id: task._id + 'tu',
                                    source: id,
                                    target: 'tu' + id,
                                    label: ''
                                }
                            )
                        }
                        task.users.forEach( user => {
                            this.links.push(
                                {
                                    id: task._id + 'tu' + user,
                                    source: 'tu' + id,
                                    target: 'user' + user,
                                    label: 'assigned to'
                                }
                            )
                        } )
                    } );
                    if ( tasksCluster.childNodeIds.length > 0 ) this.clusters.push( tasksCluster );
                    resolve()
                },
                error: error => reject( error )
            } ) );
    }
}
