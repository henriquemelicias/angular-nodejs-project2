import { Component, OnInit } from '@angular/core';
import { UserService } from '@app/data/user/services/user.service';

@Component({
  selector: 'app-task-info',
  templateUrl: './task-info.component.html',
  styleUrls: ['./task-info.component.css']
})
export class TaskInfoComponent implements OnInit {

  constructor() { }

  isCurrentUser = UserService.hasSessionUser();

  ngOnInit(): void {
  }

}
