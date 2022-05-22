import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { TeamService } from "@data/team/services/team.service";
import { MeetingService } from "@data/meetings/services/meeting.service";
import { BehaviorSubject } from "rxjs";
import { MeetingSchema } from "@data/meetings/schemas/meeting.schema";
import { MeetingTypeEnum } from "@data/meetings/enums/meeting-type.enum";
import { UserSchema } from "@data/user/schemas/user.schema";
import { UserService } from "@data/user/services/user.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component( {
                selector: 'app-user-meeting-dashboard',
                templateUrl: './user-meeting-form.component.html',
                styleUrls: [ './user-meeting-form.component.css' ]
            } )
export class UserMeetingFormComponent implements OnInit {

    @Output()
    hasSubmitted: EventEmitter<void> = new EventEmitter<void>();

    public searchPossibleSessionForm: FormGroup;

    teamName = this.route.snapshot.paramMap.get( 'name' );
    todayDate = new Date();
    availableSessions$: BehaviorSubject<{ startDate: Date, endDate: Date }[]> = new BehaviorSubject<{startDate: Date; endDate: Date}[]>( [] );
    setMembersForm: FormGroup;
    users?: UserSchema[];
    selectedUsers: string[] = [];
    hasClickedButton = false;

    constructor( private formBuilder: FormBuilder,
                 private teamService: TeamService,
                 private meetingService: MeetingService,
                 private route: ActivatedRoute,
                 private userService: UserService,
                 fb: FormBuilder,
                 private modalService: NgbModal,) {

        this.searchPossibleSessionForm = formBuilder.group(
            {
                startDate: [ '', [ Validators.required ] ],
                endDate: [ '', [ Validators.required ] ],
                meetingDuration: [ '', [ Validators.required ] ],
            },
            {
                validators: [
                    this.isDateLessThan( 'startDate', 'endDate' ),
                    this.isTimeNotZero( 'meetingDuration' )
                ]
            }
        )

        this.setMembersForm = fb.group( {
                                            selectedUsers: new FormArray( [] )
                                        } );
    }

    ngOnInit(): void { }

    public get form(): { [key: string]: AbstractControl; } {
        return this.searchPossibleSessionForm.controls;
    }

    searchMeetingsPossibleSessions() {
        const startDateFormValue = this.form['startDate'].value;
        const endDateFormValue = this.form['endDate'].value;
        const meetingDurationFormValue = this.form['meetingDuration'].value;

        this.searchPossibleSessionForm.reset();

        this.meetingService.getUserMeetingPossibleSessions(
            this.selectedUsers,
            startDateFormValue,
            endDateFormValue,
            meetingDurationFormValue
        ).subscribe(
            {
                next: sessions => this.availableSessions$.next( sessions )
            } );
    }

    isDateLessThan( from: string, to: string ) {
        return ( group: FormGroup ): { [key: string]: any } => {
            let f = group.controls[from];
            let t = group.controls[to];
            if ( !f.value ) return {};
            if ( f.value && !t.value ) return {};
            if ( f.value > t.value ) {
                return {
                    dates: "Start date should be before or equal to end date."
                };
            }
            return {};
        }
    }

    private isTimeNotZero( meetingDuration: string ) {
        return ( group: FormGroup ): { [key: string]: any } => {
            let f = group.controls[meetingDuration];
            if ( f.value && f.value === "00:00") {
                return {
                    durationZeroed: "Duration needs to be at least 30 minutes"
                };
            }
            return {};
        }
    }

    addMeeting( session: { startDate: Date; endDate: Date } ) {
        this.hasClickedButton = false;
        const userMeeting = {} as MeetingSchema;
        userMeeting.type = MeetingTypeEnum.USER;
        userMeeting.startDate = session.startDate;
        userMeeting.endDate = session.endDate;
        userMeeting.users = this.selectedUsers;
        userMeeting.associatedEntity = UserService.sessionUser!.username;
        this.meetingService.addUserMeeting( userMeeting ).subscribe( { next: _ => () => this.hasSubmitted.next() });
        this.hasSubmitted.next();
    }

    setMembersSubmit(){
        this.selectedUsers = this.setMembersForm.controls['selectedUsers'].value;
    }

    openSetMembersModal(longContent: any){
        const selectedUsers = (this.setMembersForm.controls['selectedUsers'] as FormArray);
        this.hasClickedButton = true;
        this.setUsers().then( _ => {
            this._openModal( longContent );
        } );
    }

    private async setUsers() {
        return new Promise( (resolve, reject) => {
            this.userService.getUsers().subscribe(
                users => {
                    this.users = users;
                    resolve( true );
                },
                error => reject( error )
            );
        } );
    }

    onCheckboxChange( event: any ) {
        const selectedUsers = (this.setMembersForm.controls['selectedUsers'] as FormArray);
        if ( event.target.checked ) {
            selectedUsers.push( new FormControl( event.target.value ) );
        }
        else {
            const index = selectedUsers.controls
                                       .findIndex( x => x.value === event.target.value );
            selectedUsers.removeAt( index );
        }
    }

    private _openModal( longContent: any ) {
        this.modalService.open( longContent, { scrollable: true, size: "lg" } );
    }
}
