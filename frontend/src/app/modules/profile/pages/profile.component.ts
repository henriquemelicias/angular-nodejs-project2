import { Component, HostListener, OnInit } from '@angular/core';
import { AuthStorageService } from "@core/services/auth-storage/auth-storage.service";
import { AuthService, LoginOutput } from "@core/services/auth/auth.service";
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
            { validators: [ this.dateDifferent( 'unavailableStartTime', 'unavailableEndTime' ), this.dateAfterNow( 'unavailableStartTime', 'unavailableEndTime' ) ] }
        );

        this.todayDate = new Date();
        this.todayDate.setMinutes( this.todayDate.getMinutes() - this.todayDate.getTimezoneOffset() );

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
            if ( !f.value || !t.value ) return {};
            if ( f.value != t.value ) {
                return {
                    dates: "Dates should be the same"
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

    SetUnavailableTimeSubmit() {
        const startDateFormValue = this.form2['unavailableStartTime'].value;

        let unavailableStartTime;
        if ( startDateFormValue ) {
            const startDateTokens = startDateFormValue.split( /[-T:]/ );
            unavailableStartTime = new Date(
                parseInt( startDateTokens[0] ),
                parseInt( startDateTokens[1] ),
                parseInt( startDateTokens[2] ),
                parseInt( startDateTokens[3] ),
                parseInt( startDateTokens[4] )
            );

        }

        const endDateFormValue = this.form2['unavailableEndTime'].value;
        let unavailableEndTime;
        if ( endDateFormValue ) {
            const endDateTokens = endDateFormValue.split( /[-T:]/ );

            unavailableEndTime = new Date(
                parseInt( endDateTokens[0] ),
                parseInt( endDateTokens[1] ),
                parseInt( endDateTokens[2] ),
                parseInt( endDateTokens[3] ),
                parseInt( endDateTokens[4] )
            );
        }

        let user = {
            _id: this.user._id,
            username: this.user.username,
            roles: this.user.roles,
            tasks: this.user.tasks,
            unavailableStartTime: this.user.unavailableStartTime?.push(unavailableStartTime?),
            unavailableEndTime: this.user.unavailableEndTime?.push(unavailableEndTime?)
        };

        this.modifyUser( user );
    }

    public modifyUser( user: UserSchema ): void {
        const logCallers = LoggerService.setCaller( this, this.modifyUser );

        this.userService.updateUser( user ).subscribe(
            {
                next: _ => {
                    this.changeDateForm.reset();
                    this.user.unavailableStartTime = user.unavailableStartTime;
                    this.user.unavailableEndTime = user.unavailableEndTime;
                    AlertService.success(
                        `User ${ user.username } created successfully`,
                        { id: "alert-task-form", isAutoClosed: true },
                        logCallers
                    );
                },
                error: ( error: SanitizedErrorInterface ) => {
                    if ( error.hasBeenHandled ) return;

                    const errorHandler = new AppErrorHandler( error );
                    errorHandler
                        .serverErrorHandler( () => {

                            if ( errorHandler.error.status === HttpStatusCode.Conflict ) {
                                AlertService.alertToApp(
                                    AlertType.Warning,
                                    error.message,
                                    {},
                                    logCallers
                                );
                                errorHandler.hasBeenHandled = true;
                            }
                        } )
                        .ifErrorHandlers( null, () => {
                            AlertService.alertToApp(
                                AlertType.Error,
                                GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                null,
                                logCallers
                            );
                        } ).toObservable();
                }
            } );
    }

}
