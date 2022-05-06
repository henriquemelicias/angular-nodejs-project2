import { Component, OnInit } from '@angular/core';
import { UserService } from "@data/user/services/user.service";


@Component( {
                selector: 'app-projects-info',
                templateUrl: './projects.component.html',
                styleUrls: [ './projects.component.css' ]
            } )


export class ProjectsComponent implements OnInit {

    isCurrentUserAdmin = UserService.isSessionUser();

    constructor() {}

    ngOnInit(): void {
    }



}
