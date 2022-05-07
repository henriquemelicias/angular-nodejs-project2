import { Component, OnInit } from '@angular/core';
import { TaskSchema } from '@app/data/task/schemas/task.schema';
import { TaskService } from '@app/data/task/services/task.service';
import { ActivatedRoute } from '@angular/router';
import { UserSchema } from '@app/data/user/schemas/user.schema';
import { UserService } from '@app/data/user/services/user.service';

@Component( {
                selector: 'app-get-task-info',
                templateUrl: './get-task-info.component.html',
                styleUrls: [ './get-task-info.component.css' ]
            } )
export class GetTaskInfoComponent implements OnInit {

    task: TaskSchema | undefined;
    task_users: UserSchema[] = [];
    users: UserSchema[] | undefined;
    selected: UserSchema | undefined;
    search: UserSchema[] = [];

    constructor(
        private taskService: TaskService,
        private route: ActivatedRoute,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.getTask();
        this.getUsers();
    }

    getTask(): void {
        this.taskService.getTask( this.route.snapshot.params['id'] ).subscribe( task => this.task = task );
        this.task_users = [];
        if ( this.task?.users ) {
            console.log( this.task?.users );

            for ( let index = 0; index < this.task.users.length; index++ ) {
                this.getUserById( this.task.users[index]._id );
            }
        }
        console.log( this.task_users );

    }

    getUserById( id: string ): void {
        this.userService.getUsersById( id ).subscribe( user => this.task_users.push( user ) );
    }

    getUsers(): void {
        this.userService.getUsers().subscribe( users => this.users = users );
        console.log( "hahahha" );

        console.log( this.users );

    }

    save(): void {
        if ( this.task ) {
            this.taskService.updateTask( this.task ).subscribe();
        }
    }

    clickedUser( user: UserSchema ): void {
        this.selected = user;
    }

    associate(): void {
        if ( this.selected ) {
            this.task?.users?.push( this.selected );
        }
        this.save();
        this.update();
    }

    disassociate( id: string ): void {
        if ( this.task?.users ) {
            let i = undefined;
            for ( let index = 0; index < this.task.users.length; index++ ) {
                if ( String( this.task.users[index] ) === id ) {
                    i = index;
                }
            }

            if ( i ) {
                this.task.users.splice( i, 1 );

            }
            this.save();
            this.update();
        }
    }

    update(): void {
        this.getTask();
        this.getUsers();
    }

}
