import { Component, OnInit } from '@angular/core';
import { TaskService } from '@data/task/services/task.service'
import { TaskSchema } from '@data/task/schemas/task.schema';
import { UserService } from '@app/data/user/services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-task-info',
  templateUrl: './task-info.component.html',
  styleUrls: [ './task-info.component.css']
})
export class TaskInfoComponent implements OnInit {

  selectedPriority: string = '';
  username: string = "";

  constructor(private taskService: TaskService) { 
    const userPromise = firstValueFrom( UserService.getSessionUser$() );

    userPromise.then( user => {
      if ( user ) {
        this.username = user.username;
      }
    } );
  }

  ngOnInit(): void {
  }

  selectChangeHandler (event: any) {
    this.selectedPriority= event.target.value;
  }

  addTask(name: string): void {
    const t:TaskSchema = {name: name, priority: this.selectedPriority, percentage: 0, madeBy: this.username};
    this.taskService.addTask(t).subscribe();
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe();
  }

}
