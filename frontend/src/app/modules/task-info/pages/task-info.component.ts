import { Component, OnInit } from '@angular/core';
import { TaskService } from '@data/task/services/task.service'
import { TaskSchema } from '@data/task/schemas/task.schema';

@Component({
  selector: 'app-task-info',
  templateUrl: './task-info.component.html',
  styleUrls: [ './task-info.component.css']
})
export class TaskInfoComponent implements OnInit {

  name:String = '';
  selectedPriority: string = '';
  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
  }

  selectChangeHandler (event: any) {
    this.selectedPriority= event.target.value;
  }

  addTask(name: string): void {
    const t:TaskSchema = {name: name, priority: this.selectedPriority, percentage: 0};
    this.taskService.addTask(t).subscribe();
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe();
  }

}
