import { Component, OnInit } from '@angular/core';
import { TaskSchema } from '@app/data/task/schemas/task.schema';
import { TaskService } from '@app/data/task/services/task.service';
import { ActivatedRoute } from '@angular/router';
import { UserSchema } from '@app/data/user/schemas/user.schema';
import { UserService } from '@app/data/user/services/user.service';

@Component({
  selector: 'app-get-task-info',
  templateUrl: './get-task-info.component.html',
  styleUrls: ['./get-task-info.component.css']
})
export class GetTaskInfoComponent implements OnInit {

  task: TaskSchema | undefined;
  users: UserSchema[] | undefined;
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
    this.taskService.getTask(this.route.snapshot.params['id']).subscribe(task => this.task = task);
  }

  getUsers(): void {  
    this.userService.getUsers().subscribe(users => this.users = users);
  }

  save(): void {
    if(this.task) {
      this.taskService.updateTask(this.task).subscribe();
    }
  }

}
