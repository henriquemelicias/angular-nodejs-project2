import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaskSchema } from '@app/data/task/schemas/task.schema';
import { UserSchema } from "@data/user/schemas/user.schema";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { TaskService } from "@data/task/services/task.service";
import { UserService } from "@data/user/services/user.service";

@Component( {
                selector: 'app-set-users-to-task-form',
                templateUrl: './set-users-to-task-form.component.html',
                styleUrls: [ '../pages/task-info.component.css' ]
            } )
export class AddUserToTaskForm implements OnInit {

    @Input() task!: TaskSchema;
    @Input() users!: UserSchema[];

    @Output() taskChange: EventEmitter<TaskSchema> = new EventEmitter<TaskSchema>();

    public addUsersToTaskForm: FormGroup;

    constructor( private formBuilder: FormBuilder, private taskService: TaskService, private userService: UserService ) {
        this.addUsersToTaskForm = formBuilder.group(
            {
                checkArray: new FormArray([])
            }
        )
    }

    ngOnInit(): void {}

    public get form(): { [key: string]: AbstractControl; } {
        return this.addUsersToTaskForm.controls;
    }

    public submitForm() {
        console.log( this.form["checkArray"] );
        const newTask = {} as TaskSchema;
        newTask._id = this.task._id;
        newTask.name = this.task.name;
        newTask.madeByUser = this.task.madeByUser;
        newTask.priority = this.task.priority;
        newTask.percentage = this.task.percentage;
        newTask.users = this.form["checkArray"].value;


        this.taskService.updateTask( newTask ).subscribe( task => { this.task = task });
        this.update();
    }

    update()
    {
        this.taskChange.emit( this.task );
    }

    onCheckChange( event: any ) {
        const formArray: FormArray = this.addUsersToTaskForm.get( 'checkArray' ) as FormArray;

        /* Selected */
        if ( event.target.checked ) {
            // Add a new control in the arrayForm
            formArray.push( new FormControl( event.target.value ) );
        }
        /* unselected */
        else {
            // find the unselected element
            let i: number = 0;

            // @ts-ignore
            formArray.controls.forEach( ( ctrl: FormControl ) => {
                if ( ctrl.value == event.target.value ) {
                    // Remove the unselected element from the arrayForm
                    formArray.removeAt( i );
                    return;
                }

            } );
        }
    }
}
