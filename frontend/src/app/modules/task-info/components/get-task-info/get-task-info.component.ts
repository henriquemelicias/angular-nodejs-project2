import { Component, OnInit } from '@angular/core';
import { TaskSchema } from '@app/data/task/schemas/task.schema';
import { TaskService } from '@app/data/task/services/task.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-get-task-info',
  templateUrl: './get-task-info.component.html',
  styleUrls: ['./get-task-info.component.css']
})
export class GetTaskInfoComponent implements OnInit {

  task: TaskSchema | undefined;
  constructor(private taskService: TaskService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getTask();
    
  }

  getTask(): void {
    this.taskService.getTask(this.route.snapshot.params['id']).subscribe(task => this.task = task);
    console.log(this.task?.name);
  }

}
