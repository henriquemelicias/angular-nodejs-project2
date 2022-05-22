import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { TeamService } from "@data/team/services/team.service";
import { MeetingService } from "@data/meetings/services/meeting.service";
import { BehaviorSubject } from "rxjs";
import { MeetingSchema } from "@data/meetings/schemas/meeting.schema";
import { MeetingTypeEnum } from "@data/meetings/enums/meeting-type.enum";

@Component( {
                selector: 'app-team-agenda-dashboard',
                templateUrl: './team-agenda-form.component.html',
                styleUrls: [ './team-agenda-form.component.css' ]
            } )
export class TeamAgendaFormComponent implements OnInit {

    @Output()
    hasSubmitted: EventEmitter<void> = new EventEmitter<void>();

    public searchPossibleSessionForm: FormGroup;

    teamName = this.route.snapshot.paramMap.get( 'name' );
    todayDate = new Date();
    availableSessions$: BehaviorSubject<{ startDate: Date, endDate: Date }[]> = new BehaviorSubject<{startDate: Date; endDate: Date}[]>( [] );

    constructor( private formBuilder: FormBuilder,
                 private teamService: TeamService,
                 private meetingService: MeetingService,
                 private route: ActivatedRoute ) {

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

        this.meetingService.getTeamMeetingPossibleSessions(
            // @ts-ignore
            this.teamName,
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
        const teamMeeting = {} as MeetingSchema;
        teamMeeting.type = MeetingTypeEnum.TEAM;
        teamMeeting.startDate = session.startDate;
        teamMeeting.endDate = session.endDate;
        teamMeeting.users = [];
        teamMeeting.associatedEntity = this.teamName!;
        this.meetingService.addTeamMeeting( teamMeeting ).subscribe( { next: _ => () => this.hasSubmitted.next() });
        this.hasSubmitted.next();
    }
}
