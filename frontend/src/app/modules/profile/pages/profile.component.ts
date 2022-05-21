import { Component, HostListener, OnInit } from '@angular/core';
import { AuthStorageService } from "@core/services/auth-storage/auth-storage.service";
import { LoginOutput } from "@core/services/auth/auth.service";
import { UserService } from "@data/user/services/user.service";
import { firstValueFrom } from "rxjs";
import { Title } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { UserSchema } from '@app/data/user/schemas/user.schema';
import { LoggerService } from '@app/core/services/logger/logger.service';
import { AlertService } from '@app/core/services/alert/alert.service';
import { SanitizedErrorInterface } from '@app/core/models/sanitized-error.interface';
import { AppErrorHandler } from '@app/core/utils/class-error-handler.util';
import { HttpStatusCode } from "@angular/common/http";
import { AlertType } from '@app/core/models/alert.model';
import { GenericMessageEnum } from '@app/core/enums/generic-message.enum';


@Component( {
                selector: 'app-home',
                templateUrl: './profile.component.html',
                styleUrls: [ './profile.component.css' ]
            } )
export class ProfileComponent implements OnInit {

    user!: UserSchema;
    token = AuthStorageService.getToken();

    public todayDate: Date;
    currentUser?: LoginOutput;
    tokenNumberOfChars: number;
    changeDateForm: FormGroup;

    constructor( private titleService: Title, private modalService: NgbModal, fb: FormBuilder, private userService: UserService, ) {

        this.changeDateForm = fb.group(
            {
                unavailableStartTime: [
                    '', []
                ],
                unavailableEndTime: [
                    '', []
                ]
            },
            { validators: [ 
                this.dateDifferent( 'unavailableStartTime', 'unavailableEndTime' ),
                this.dateAfterNow( 'unavailableStartTime', 'unavailableEndTime' ),  
            ] }
        );

        this.todayDate = new Date();
        this.todayDate.setMinutes( this.todayDate.getMinutes() - this.todayDate.getTimezoneOffset() );

        this.tokenNumberOfChars = window.innerWidth / 23;
        const userPromise = firstValueFrom( UserService.getSessionUser$() );

        userPromise.then( user => {
            if ( user && this.token ) {
                this.user = user;
                this.currentUser = { username: user.username, token: this.token, roles: user.roles } as LoginOutput;
            }
        } );
    };

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - Profile" );
    }

    @HostListener( 'window:resize', [ '$event' ] )
    onResize( _: Event ) {
        this.tokenNumberOfChars = window.innerWidth / 23;
    }

    public openSetUnavailableDateModal( longContent: any ) {
        this._openModal( longContent );
    }

    private _openModal( longContent: any ) {
        this.modalService.open( longContent, { scrollable: true, size: "lg" } );
    }

    dateDifferent( from: string, to: string ) {
        return ( group: FormGroup ): { [key: string]: any } => {
            let f = group.controls[from];
            let t = group.controls[to];
            if ( new Date (f.value).getDate() != new Date(t.value).getDate() ) {
                return {
                    dates: "Dates should be the same"
                };
            }

            if ( new Date (f.value).getTime() >= new Date(t.value).getTime() ) {
                return {
                    time: "End hour should be after start hour"
                };
            }
            return {};
        }
    }

    dateAfterNow( from: string, to: string ) {
        return ( group: FormGroup ): { [key: string]: any } => {
            let f = group.controls[from];
            let t = group.controls[to];
            if ( f.value ) {
                if ( new Date( f.value ) < (new Date()) ) {
                    return {
                        dates3: "Dates should be after now."
                    };
                }
            }
            if ( t.value ) {
                if ( new Date( t.value ) < (new Date()) ) {
                    return {
                        dates2: "Dates should be after now."
                    };
                }
            }
            return {};
        }
    }

    public get form2(): { [key: string]: AbstractControl; } {
        return this.changeDateForm.controls;
    }

}
