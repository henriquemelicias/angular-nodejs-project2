import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { TeamService } from "@data/team/services/team.service";
import { UserService } from "@data/user/services/user.service";
import { Subject } from "rxjs";
import { AuthRolesEnum } from "@data/user/enums/auth-roles.enum";
import { ProjectService } from "@data/project/services/project.service";
import { TaskService } from "@data/task/services/task.service";
import * as shape from 'd3-shape';
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceCenter } from 'd3-force';
import { ProjectSchema } from "@data/project/schemas/project.schema";
import { TaskSchema } from "@data/task/schemas/task.schema";

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
    team?: string
}

@Component( {
                selector: 'app-overview',
                templateUrl: './overview.component.html',
                styleUrls: [ './overview.component.css' ]
            } )
export class OverviewComponent implements OnInit {

    isGraphEnabled: boolean = true;

    nodesTypes: Node[] = [];
    linksTypes: Link[] = [];
    clustersTypes: Cluster[] = [];

    nodesTeams: Node[] = [];
    linksTeams: Link[] = [];
    clustersTeams: Cluster[] = [];

    // Radio
    clusterRadio = [
        { name: 'Types' },
        { name: 'Teams' },
    ];
    selectedClusterRadio = this.clusterRadio[1];

    d3ForceSettings = {
        force: forceSimulation<any>().force( 'charge', forceManyBody().strength( -500  ) ).force(
            'center',
            forceCenter(
                window.innerWidth / 4,
                window.innerHeight / 4
            )
        ).force(
            'collide',
            forceCollide( 5 )
        ),
        forceLink: forceLink<any, any>()
            .id( ( node: any ) => node.id )
            .distance( () => 250 )
    };

    layoutRadio: any = [
        { name: 'Clusters', value: [ 'dagreCluster', {} ] },
        { name: 'Nodes', value: [ 'dagre', {} ] },
        { name: 'Force', value: [ 'd3ForceDirected', this.d3ForceSettings ] }
    ];
    selectedLayoutRadio = this.layoutRadio[0];

    // Graph settings
    layout = this.selectedLayoutRadio.value[0];
    layoutSettings = this.selectedLayoutRadio.value[1];

    // @ts-ignore
    nodes: Node[];
    // @ts-ignore
    links: Link[];
    // @ts-ignore
    clusters: Cluster[];

    update$: Subject<boolean> = new Subject();
    center$: Subject<boolean> = new Subject();
    zoomToFit$: Subject<boolean> = new Subject();
    shape = shape.curveMonotoneX;

    private projects?: ProjectSchema[];
    private tasks?: TaskSchema[];

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

        this.layout = this.selectedLayoutRadio.value[0];
        this.layoutSettings = this.selectedLayoutRadio.value[1];

        let clusterOption;
        if ( this.selectedClusterRadio.name === this.clusterRadio[0].name ) {
            clusterOption = [ this.nodesTypes, this.linksTypes, this.clustersTypes ];
        }
        else {
            clusterOption = [ this.nodesTeams, this.linksTeams, this.clustersTeams ];
        }

        // @ts-ignore
        this.nodes = clusterOption[0];
        // @ts-ignore
        this.links = clusterOption[1];
        if ( this.selectedLayoutRadio.name === this.layoutRadio[0].name ) {
            // @ts-ignore
            this.clusters = clusterOption[2];
        }
        else {
            this.clusters = [];
        }

        this.isGraphEnabled = false;
        this.update$.next( true );
        this.centerGraph();
        this.fitGraph();

        setTimeout( () => {
            this.isGraphEnabled = true;
        }, 100 );
    }

    centerGraph() {
        this.center$.next( true )
    }

    fitGraph() {
        this.zoomToFit$.next( true )
    }

    reloadAll(): void {
        Promise.allSettled(
            [
                this.reloadUsers(),
                this.reloadTeams(),
                this.reloadProjects(),
                this.reloadTasks()
            ] ).then( _ => {
            this.projects?.forEach( project => {
                const clusterTeam = this.clustersTeams.find( c => c.id === project.acronym );
                if ( clusterTeam ) {
                    clusterTeam.childNodeIds.push( 'nproject' + project.acronym );
                    clusterTeam.childNodeIds.push( 'nptnproject' + project.acronym );
                    project.tasks.forEach( t => {
                        clusterTeam.childNodeIds.push( 'ntask' + t._id );
                        const task = this.tasks?.find( t2 => t2._id === t._id );
                        if ( task ) {
                            clusterTeam.childNodeIds.push( 'ntuntask' + t._id );
                            clusterTeam.childNodeIds.push( 'ntcntask' + t._id );

                            const id = 'ntask'+ task._id;
                            const taskNode = { id: 'ntask'+ task._id, label: task.name + " - " + task.priority + " " + task.percentage + "%", type: 'Task:' } as Node;
                            this.nodesTeams.push( taskNode );

                            if ( task.users.length > 0 )
                            {
                                const taskUserLabelNode = { id: 'ntu' + 'ntask'+ task._id, label: 'assigned to', type: '' } as Node;
                                this.nodesTeams.push( taskUserLabelNode );

                                const taskUserToLabel = {
                                    id: task._id + 'ltu',
                                    source: 'ntask'+ task._id,
                                    target: 'ntu' + 'ntask'+ task._id,
                                    label: ''
                                };

                                this.linksTeams.push( taskUserToLabel );
                            }

                            if ( task.checklist.length > 0 )
                            {
                                const taskCheckItemLabelNode = {
                                    id: 'ntc' + id,
                                    label: 'has checklist with',
                                    type: ''
                                };

                                this.nodesTeams.push( taskCheckItemLabelNode );

                                const taskCheckItemToLabel = {
                                    id: task._id + 'ltc1',
                                    source: id,
                                    target: 'ntc' + id,
                                    label: ''
                                };

                                this.linksTeams.push( taskCheckItemToLabel );
                            }

                            task.checklist.forEach( item => {

                                const taskCheckItemFromLabel = {
                                    id: task._id + 'ltc2',
                                    source: 'ntc' + id,
                                    target: 'ni' + item._id,
                                    label: ''
                                };

                                this.linksTeams.push( taskCheckItemFromLabel );
                            });

                            task.users.forEach( user => {
                                const userNode = {
                                    id: task._id + 'ltu' + user,
                                    label: user,
                                    type: 'Member:'
                                };

                                clusterTeam.childNodeIds.push( task._id + 'ltu' + user );
                                this.nodesTeams.push( userNode );

                                const teamProjectFromLabel = {
                                    id: task._id + 'ltu' + user + '2',
                                    source: 'ntuntask' + t._id,
                                    target: task._id + 'ltu' + user,
                                    label: 'assigned to'
                                } as Link;

                                this.linksTeams.push( teamProjectFromLabel );
                            });

                            task.checklist.forEach( item => {
                                const itemNode = {
                                    id: 'ni' + item._id,
                                    label: item.name,
                                    type: (item.isComplete ? "✔ " : "") + 'Item:'
                                };

                                this.nodesTeams.push( itemNode );
                                clusterTeam.childNodeIds.push( 'ni' + item._id );
                            })
                        }
                    } );
                }
            } )
            this.updateGraph();
        } );

    }

    async reloadUsers(): Promise<void> {
        const usersCluster = { id: 'users', label: 'Users Cluster', childNodeIds: [] } as Cluster;
        return new Promise( ( resolve, reject ) => this.userService.getUsers().subscribe(
            {
                next: users => {
                    users.forEach( ( user ) => {
                        const userCluster = {
                            id: user.username,
                            label: 'User ' + user.username,
                            childNodeIds: []
                        } as Cluster;
                        const id = 'nuser' + user.username;
                        usersCluster.childNodeIds.push( id );
                        const userNode = {
                            id: id,
                            label: user.username,
                            type: user.roles.includes( AuthRolesEnum.ADMIN.valueOf() ) ?
                                  'Admin:' :
                                  'User:'
                        } as Node;

                        userCluster.childNodeIds.push( id );
                        this.nodesTypes.push( userNode );

                        user.tasks.forEach( ( task ) => {
                            this.linksTypes.push(
                                {
                                    id: user.username + 'lut' + task,
                                    source: id,
                                    target: 'task' + task,
                                    label: 'responsible for'
                                } as Link
                            );
                        } )
                    } )
                    if ( usersCluster.childNodeIds.length > 0 ) this.clustersTypes.push( usersCluster );
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
                        const teamCluster = {
                            id: team.projectAcronym || team._id,
                            label: 'Team ' + team.name,
                            team: team._id,
                            childNodeIds: []
                        } as Cluster;
                        const id = 'nteam' + team._id;
                        teamsCluster.childNodeIds.push( id );
                        const teamNode = { id: id, label: team.name, type: 'Team:' } as Node;
                        teamCluster.childNodeIds.push( teamNode.id );
                        this.nodesTypes.push( teamNode );
                        this.nodesTeams.push( teamNode );

                        if ( team.projectAcronym ) {
                            const teamProjectLabelNode = { id: 'ntp' + id, label: 'works on', type: '' };
                            teamCluster.childNodeIds.push( teamProjectLabelNode.id );
                            teamCluster.childNodeIds.push( 'nproject' + team.projectAcronym );

                            this.nodesTypes.push( teamProjectLabelNode );
                            this.nodesTeams.push( teamProjectLabelNode );

                            const teamProjectToLabel = {
                                id: team._id + 'ltp' + team.projectAcronym + '1',
                                source: id,
                                target: 'ntp' + id,
                                label: ''
                            };
                            this.linksTypes.push( teamProjectToLabel );
                            this.linksTeams.push( teamProjectToLabel );

                            const teamProjectFromLabel = {
                                id: team._id + 'ltp' + team.projectAcronym + '2',
                                source: 'ntp' + id,
                                target: 'nproject' + team.projectAcronym,
                                label: 'works on'
                            } as Link

                            this.linksTypes.push( teamProjectFromLabel );
                            this.linksTeams.push( teamProjectFromLabel );
                        }

                        if ( team.members.length > 0 ) {
                            const teamMemberLabelNode = { id: 'ntm' + id, label: 'has member', type: '' } as Node;
                            teamCluster.childNodeIds.push( teamMemberLabelNode.id );
                            this.nodesTypes.push( teamMemberLabelNode );
                            this.nodesTeams.push( teamMemberLabelNode );

                            const teamMemberToLabel = {
                                id: team._id + 'ltm',
                                source: id,
                                target: 'ntm' + id,
                                label: ''
                            };

                            this.linksTypes.push( teamMemberToLabel );
                            this.linksTeams.push( teamMemberToLabel );
                        }
                        team.members.forEach( ( member ) => {

                            const userNode = {
                                id: 'nuser' + member + team._id,
                                label: member,
                                type: 'Member: '
                            } as Node;

                            this.nodesTeams.push( userNode );
                            teamCluster.childNodeIds.push( userNode.id );

                            const teamMemberFromLabelClusterType = {
                                id: team._id + 'ltu' + member,
                                source: 'ntm' + id,
                                target: 'nuser' + member,
                                label: 'has member'
                            } as Link

                            const teamMemberFromLabelClusterTeams = {
                                id: team._id + 'ltu' + member,
                                source: 'ntm' + id,
                                target: 'nuser' + member + team._id,
                                label: 'has member'
                            } as Link

                            this.linksTypes.push( teamMemberFromLabelClusterType );
                            this.linksTeams.push( teamMemberFromLabelClusterTeams );
                        } );

                        this.clustersTeams.push( teamCluster );
                    } )
                    if ( teamsCluster.childNodeIds.length > 0 ) this.clustersTypes.push( teamsCluster );
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
                    this.projects = projects;
                    projects.forEach( ( project ) => {
                        const id = 'nproject' + project.acronym;
                        projectsCluster.childNodeIds.push( id );
                        const projectNode = {
                            id: id,
                            label: project.acronym + ' - ' + project.name,
                            type: 'Project:'
                        } as Node;
                        this.nodesTypes.push( projectNode );
                        this.nodesTeams.push( projectNode );

                        if ( project.tasks.length > 0 ) {
                            const projectTaskLabelNode = { id: 'npt' + id, label: 'contains', type: '' };
                            this.nodesTypes.push( projectTaskLabelNode );
                            this.nodesTeams.push( projectTaskLabelNode );

                            const teamMemberToLabel = {
                                id: project.acronym + 'lpt',
                                source: id,
                                target: 'npt' + id,
                                label: ''
                            }
                            this.linksTypes.push( teamMemberToLabel );
                            this.linksTeams.push( teamMemberToLabel );
                        }
                        project.tasks.forEach( ( task ) => {
                            const teamMemberFromLabel = {
                                id: project.acronym + 'lpt' + task._id,
                                source: 'npt' + id,
                                target: 'ntask' + task._id,
                                label: 'contains'
                            } as Link;
                            this.linksTypes.push( teamMemberFromLabel );
                            this.linksTeams.push( teamMemberFromLabel );
                        } )
                    } )
                    if ( projectsCluster.childNodeIds.length > 0 ) this.clustersTypes.push( projectsCluster );
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
                    this.tasks = tasks;
                    tasks.forEach( ( task ) => {
                        const id = 'ntask' + task._id;
                        tasksCluster.childNodeIds.push( id );
                        const taskNode = { id: id, label: task.name + " - " + task.priority + " " + task.percentage + "%", type: 'Task:' } as Node;
                        this.nodesTypes.push( taskNode );

                        if ( task.users.length > 0 ) {
                            const taskUserLabelNode = { id: 'ntu' + id, label: 'assigned to', type: '' } as Node;
                            this.nodesTypes.push( taskUserLabelNode );

                            const taskUserToLabel = {
                                id: task._id + 'ltu',
                                source: id,
                                target: 'ntu' + id,
                                label: ''
                            };

                            this.linksTypes.push( taskUserToLabel );
                        }
                        task.users.forEach( user => {
                            this.linksTypes.push(
                                {
                                    id: task._id + 'ltu' + user,
                                    source: 'ntu' + id,
                                    target: 'nuser' + user,
                                    label: 'assigned to'
                                }
                            )
                        } );
                    } );
                    if ( tasksCluster.childNodeIds.length > 0 ) this.clustersTypes.push( tasksCluster );
                    resolve()
                },
                error: error => reject( error )
            } ) );
    }
}
