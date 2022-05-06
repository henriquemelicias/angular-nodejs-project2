import { Component, OnInit } from '@angular/core';
import { UserService } from "@data/user/services/user.service";

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  isSessionUserAdmin = UserService.isSessionUserAdmin();

  constructor() { }

  ngOnInit(): void {
  }

}
