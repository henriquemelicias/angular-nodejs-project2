import { Component, OnInit } from '@angular/core';
import { UserService } from "@data/user/services/user.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";



@Component( {
                selector: 'app-teams',
                templateUrl: './teams.component.html',
                styleUrls: [ './teams.component.css' ]
            } )
export class TeamsComponent implements OnInit {

    isSessionUserAdmin = UserService.isSessionUserAdmin();
    closeResult = '';

    constructor( private offcanvasService: NgbOffcanvas ) { }

    ngOnInit(): void {
    }

    openOffCanvas(content: any) {
        this.offcanvasService.open(content, {ariaLabelledBy: 'offcanvas-basic-title'});
    }
}
