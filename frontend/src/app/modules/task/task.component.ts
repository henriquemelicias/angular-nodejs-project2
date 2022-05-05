import { Component, OnInit } from '@angular/core';
import { TaskService } from '@modules/task/task.service';
import { Task } from '@modules/task/task';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  name:String = '';
  selectedPriority: string = '';
  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
  }

  selectChangeHandler (event: any) {
    this.selectedPriority= event.target.value;
  }

  addTask(name: string): void {
    const t:Task = {name: name, priority: this.selectedPriority, percentage: 0};
    this.taskService.addTask(t).subscribe();
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe();
  }

}
