import { Component, OnInit } from '@angular/core';
import { TaskService } from '@app/core/services/task/task.service';
import { Task } from '@app/core/models/task';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
