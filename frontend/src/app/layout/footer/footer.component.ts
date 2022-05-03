import { Component } from '@angular/core';

import { MediaEnum } from "@core/enums/media.enum"

@Component( {
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: [ './footer.component.css' ]
} )
export class FooterComponent {

  public MediaQuery = MediaEnum;
  currentYear = new Date().getUTCFullYear();

  navItems = [
    { link: '/login', routerLink: 'login', title: 'Login' },
  ];

  constructor( ) {}
}
