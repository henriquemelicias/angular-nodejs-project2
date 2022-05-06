import { Component, OnInit } from '@angular/core';
import { UserService } from "@data/user/services/user.service";

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  constructor() { }

  isCurrentUser = UserService.hasSessionUser();

  ngOnInit(): void {
  }

}
