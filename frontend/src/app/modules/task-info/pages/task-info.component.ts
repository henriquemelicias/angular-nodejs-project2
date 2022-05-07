import { Component, OnInit } from '@angular/core';
import { TaskService } from "@data/task/services/task.service";
import { ActivatedRoute } from "@angular/router";
import { TaskSchema } from "@data/task/schemas/task.schema";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";

@Component( {
                selector: 'app-task-info',
                templateUrl: './task-info.component.html',
                styleUrls: [ './task-info.component.css' ]
            } )
export class TaskInfoComponent implements OnInit {

    task?: TaskSchema;

    constructor( private taskService: TaskService, private route: ActivatedRoute, ) {
        this._getTaskByIdFromRoute();
        this._ifNoTaskFound();
    }

    ngOnInit(): void {
    }

    private _getTaskByIdFromRoute() {
        this.taskService.getTask( this.route.snapshot.params['_id'] )
            .subscribe(
                {
                next: task => this.task = task
                        } )
    }

    private _ifNoTaskFound() {
        setTimeout(() => {
            if ( !this.task ) {
                AlertService.alertToApp( AlertType.Error, "Task not found" );
            }
        }, 1000);
    }

}
