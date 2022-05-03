import { Component, OnInit } from '@angular/core';
import { AuthStorageService } from "@core/services/auth-storage/auth-storage.service";
import { AuthService, LoginOutput } from "@core/services/auth/auth.service";
import { UserService } from "@data/user/services/user.service";
import { firstValueFrom } from "rxjs";


@Component( {
              selector: 'app-home',
              templateUrl: './profile.component.html',
              styleUrls: [ './profile.component.css' ]
            } )
export class ProfileComponent implements OnInit {

  token = AuthStorageService.getToken();

  currentUser?: LoginOutput;

  constructor( ) {
    const userPromise = firstValueFrom( UserService.getSessionUser$() );

    userPromise.then( user => {
      if ( user && this.token ) {
        this.currentUser = { username: user.username, email: user.email, token: this.token } as LoginOutput;
      }
    } );
  };

  ngOnInit(): void {
  }

}
