import { Component, HostListener, OnInit } from '@angular/core';
import { AuthStorageService } from "@core/services/auth-storage/auth-storage.service";
import { AuthService, LoginOutput } from "@core/services/auth/auth.service";
import { UserService } from "@data/user/services/user.service";
import { firstValueFrom } from "rxjs";
import { Title } from "@angular/platform-browser";


@Component( {
                selector: 'app-home',
                templateUrl: './profile.component.html',
                styleUrls: [ './profile.component.css' ]
            } )
export class ProfileComponent implements OnInit {

    token = AuthStorageService.getToken();

    currentUser?: LoginOutput;
    tokenNumberOfChars: number;

    constructor( private titleService: Title ) {
        this.tokenNumberOfChars = window.innerWidth / 25;
        const userPromise = firstValueFrom( UserService.getSessionUser$() );

        userPromise.then( user => {
            if ( user && this.token ) {
                this.currentUser = { username: user.username, token: this.token, roles: user.roles } as LoginOutput;
            }
        } );
    };

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - Profile" );
    }

    @HostListener( 'window:resize', [ '$event' ] )
    onResize( _: Event ) {
        this.tokenNumberOfChars = window.innerWidth / 25;
    }

}
