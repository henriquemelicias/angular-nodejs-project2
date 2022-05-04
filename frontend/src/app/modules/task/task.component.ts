import { Component, OnInit } from '@angular/core';
import { TaskService } from '@modules/task/task.service';
import { Task } from '@modules/task/task';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
  }

  addTask(name: string, priority: string): void {
    const t:Task = {name: name, priority: priority, percentage: 0};
    this.taskService.addTask(t);
  }

}
