import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { AlertService } from "@core/services/alert/alert.service";
import { LoggerService } from "@core/services/logger/logger.service";
import { SanitizedErrorInterface } from "@core/models/sanitized-error.interface";
import { AppErrorHandler } from "@core/utils/class-error-handler.util";
import { HttpStatusCode } from "@angular/common/http";
import { AlertType } from "@core/models/alert.model";
import { GenericMessageEnum } from "@core/enums/generic-message.enum";
import { UserSchema } from "@data/user/schemas/user.schema";
import { UserService } from "@data/user/services/user.service";
import { ActivatedRoute } from "@angular/router";

@Component( {
                selector: 'app-user-agenda-dashboard',
                templateUrl: './user-agenda-form.component.html',
                styleUrls: [ './user-agenda-form.component.css' ]
            } )
export class UserAgendaFormComponent implements OnInit {

    @Output()
    hasSubmitted: EventEmitter<void> = new EventEmitter<void>();

    public unavailableTimeForm: FormGroup;

    user!: UserSchema;
    todayDate = new Date();

    constructor( private formBuilder: FormBuilder,
                 private userService: UserService,
                 private route: ActivatedRoute ) {
        // @ts-ignore
        userService.getUserByUsername( this.route.snapshot.paramMap.get( 'username' ) ).subscribe(
            {
                next: user => this.user = user,
                error: error => AlertService.alertToApp( AlertType.Error, error, { isCloseable: true } ),
            }
        );

        this.unavailableTimeForm = formBuilder.group(
            {
                date: [ '', [ Validators.required ] ],
                startTime: [ '', [ Validators.required ] ],
                endTime: [ '', [ Validators.required ] ]
            },
            {
                validators: [
                    this.timeLessThan( 'startTime', 'endTime' ),
                    this.startTimeAfterCurrentTime( 'startTime', 'date' )
                ]
            }
        )
    }

    ngOnInit(): void { }

    public get form(): { [key: string]: AbstractControl; } {
        return this.unavailableTimeForm.controls;
    }

    onUnavailableTimeSubmit() {
        const dateFormValue = this.form['date'].value;
        const startTimeFormValue = this.form['startTime'].value;
        const endTimeFormValue = this.form['endTime'].value;

        const user = {
            ...this.user
        }

        user.unavailableTimes.push(
            {
                startDate: new Date( dateFormValue + ' ' + startTimeFormValue ),
                endDate: new Date( dateFormValue + ' ' + endTimeFormValue )
            }
        )

        this.modifyUser( user );
    }

    modifyUser( user: UserSchema ): void {
        const logCallers = LoggerService.setCaller( this, this.modifyUser );

        this.userService.updateUser( user ).subscribe(
            {
                next: user => {
                    this.unavailableTimeForm.reset();
                    this.user = user;
                    AlertService.success(
                        `Unavailable period created successfully`,
                        { id: "alert-task-form", isAutoClosed: true },
                        logCallers
                    );
                    this.hasSubmitted.next();
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
                                    { isCloseable: true },
                                    logCallers
                                );
                                errorHandler.hasBeenHandled = true;
                            }
                        } )
                        .ifErrorHandlers( null, () => {
                            AlertService.alertToApp(
                                AlertType.Error,
                                GenericMessageEnum.UNEXPECTED_UNHANDLED_ERROR + error.message,
                                { isCloseable: true },
                                logCallers,
                            );
                        } ).toObservable();
                }
            } );
    };

    timeLessThan( from: string, to: string ) {
        return ( group: FormGroup ): { [key: string]: any } => {
            let f = group.controls[from];
            let t = group.controls[to];
            if ( !f.value ) return {};
            if ( f.value && !t.value ) return {};
            if ( f.value >= t.value ) {
                return {
                    times: "Start time should be before end time."
                };
            }
            return {};
        }
    }

    startTimeAfterCurrentTime( startTime: string, date: string ) {
        return ( group: FormGroup ): { [key: string]: any } => {
            let f = group.controls[startTime];
            let d = group.controls[date];
            const currentDate = new Date();
            const currentTime = currentDate.toISOString().slice( 11, 16 ).split( ':' );
            if ( f.value ) {
                const selectedStartTime = f.value.split( ':' );
                selectedStartTime[0] = '' +
                                       (parseInt( selectedStartTime[0] ) +
                                       Number( currentDate.getTimezoneOffset() / 60 ));
                if ( d.value &&
                     d.value <= new Date().toISOString().slice( 0, 10 ) &&
                     selectedStartTime[0] < currentTime[0] ||
                     (selectedStartTime[0] === currentTime[0] && selectedStartTime[1] <= currentTime[1]) ) {
                    return {
                        startTimeError: "Start time should start after the current time"
                    };
                }
            }
            return {};
        }
    }
}
