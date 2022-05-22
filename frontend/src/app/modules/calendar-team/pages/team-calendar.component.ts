import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject } from "rxjs";
import { TaskSchema } from "@data/task/schemas/task.schema";
import { NgbModal, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute } from "@angular/router";
import { UserService } from "@data/user/services/user.service";
import { TaskService } from "@data/task/services/task.service";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { LocalStorageKeyEnum } from "@core/enums/local-storage-key.enum";
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from "angular-calendar";
import { isSameDay, isSameMonth } from "date-fns";
import { TeamSchema } from "@data/team/schemas/team.schema";
import { TeamService } from "@data/team/services/team.service";
import { MeetingSchema } from "@data/meetings/schemas/meeting.schema";
import { MeetingService } from "@data/meetings/services/meeting.service";
import { MeetingTypeEnum } from "@data/meetings/enums/meeting-type.enum";

const colors: any = {
    red: {
        primary: '#ad2121',
        secondary: '#ffe97d',
    },
    blue: {
        primary: '#1e90ff',
        secondary: '#D1E8FF',
    },
    yellow: {
        primary: '#e3bc08',
        secondary: '#FDF1BA',
    },
};

@Component( {
                selector: 'app-team-calendar',
                templateUrl: './team-calendar.component.html',
                styleUrls: [ './team-calendar.component.css' ]
            } )
export class TeamCalendarComponent implements OnInit {

    @ViewChild( 'modalContent', { static: true } ) modalContent: TemplateRef<any> | undefined;

    team$: BehaviorSubject<TeamSchema | undefined> = new BehaviorSubject<TeamSchema | undefined>( undefined )
    tasksAssignedToUsers!: TaskSchema[];
    unavailabilityTeamMemberPeriods!: { startDate: Date, endDate: Date, user: string }[];
    meetings?: MeetingSchema[];
    teamName: string;
    sessionUser;

    constructor( private modal: NgbModal,
                 private route: ActivatedRoute,
                 private offcanvasService: NgbOffcanvas,
                 private teamService: TeamService,
                 private taskService: TaskService,
                 private meetingService: MeetingService,
                 private userService: UserService ) {
        // @ts-ignore
        this.teamName = route.snapshot.paramMap.get( 'name' );
        this.reload();
        this.sessionUser = UserService.sessionUser;
    }

    ngOnInit(): void {
        const radioButtons = document.getElementsByClassName( 'overview__buttons__btn' );
        const calHeaders = document.getElementsByClassName( 'cal-header' );

        if ( calHeaders ) {
            for ( let i = 0; i < calHeaders.length; i++ ) {
                const calHeaderElement = calHeaders[i] as HTMLElement;
                calHeaderElement.tabIndex = -1;
            }
        }

        if ( radioButtons ) {
            for ( let i = 0; i < radioButtons.length; i++ ) {
                const radioButtonElement = radioButtons[i] as HTMLElement;
                radioButtonElement.addEventListener( 'focusin', function () {
                    const dialogBoxContainerElement = document.createElement( 'div' );
                    dialogBoxContainerElement.setAttribute( 'id', 'radio-buttons-use-arrow-keys-popup-dialog' );
                    dialogBoxContainerElement.setAttribute( 'style', "position: relative; width: 0; height: 0;" );

                    const dialogBoxElement = document.createElement( 'div' );
                    dialogBoxElement.innerHTML = "Use&nbsp;arrow&nbsp;keys";
                    dialogBoxElement.setAttribute(
                        'style',
                        'position: absolute; bottom: 2.8rem; left:5rem; font-size:1.2rem; color: var( --font-color-highlight) '
                    );
                    dialogBoxContainerElement.appendChild( dialogBoxElement );

                    // @ts-ignore
                    radioButtonElement.parentElement.appendChild( dialogBoxContainerElement );
                } );
                radioButtonElement.addEventListener( 'focusout', function () {
                    const arrowKeysPopupDialogElement = document.getElementById(
                        'radio-buttons-use-arrow-keys-popup-dialog' ) as HTMLElement;
                    // @ts-ignore
                    arrowKeysPopupDialogElement.parentElement.removeChild( arrowKeysPopupDialogElement );
                } )
            }
        }
    }

    ngOnDestroy(): void {
    }

    public reload() {
        Promise.all(
            [
                new Promise( ( resolve, reject ) => this.teamService.getTeamByName( this.teamName ).subscribe(
                    {
                        next: team => {
                            this.team$.next( team );
                            resolve( true );
                        },
                        error: error => {
                            AlertService.alertToApp( AlertType.Error, 'Team not found', { isCloseable: true } );
                            reject( error );
                        },
                    } )
                ),
                new Promise( ( resolve, reject ) => this.userService.getUsersByTeam( this.teamName ).subscribe(
                    {
                        next: users => {
                            this.unavailabilityTeamMemberPeriods
                                = users.flatMap( u => u.unavailableTimes.flatMap( ut => {
                                return {
                                    startDate: ut.startDate,
                                    endDate: ut.endDate,
                                    user: u.username
                                }
                            } ) );
                            resolve( true );
                        },
                        error: error => {
                            AlertService.alertToApp( AlertType.Error, 'Team not found', { isCloseable: true } );
                            reject( error );
                        },
                    } )
                ),
                new Promise( ( resolve, reject ) => this.taskService.getTasksWithPeriodByTeam( this.teamName )
                                                        .subscribe(
                                                            {
                                                                next: tasks => {
                                                                    this.tasksAssignedToUsers = tasks;
                                                                    resolve( resolve );
                                                                },
                                                                error: error => {
                                                                    AlertService.alertToApp(
                                                                        AlertType.Error,
                                                                        error,
                                                                        { isCloseable: true }
                                                                    );
                                                                    reject( error );
                                                                },
                                                            }
                                                        ) ),
                new Promise( ( resolve, reject ) => this.meetingService.getMeetingsByTeam( this.teamName ).subscribe(
                    {
                        next: meetings => {
                            this.meetings = meetings
                            resolve( resolve );
                        },
                        error: error => {
                            AlertService.alertToApp( AlertType.Error, 'Team not found', { isCloseable: true } );
                            reject( error );
                        },
                    } )
                ),
            ]
        ).then( () => this._changeCalendarEntries() );
    }

    private _changeCalendarEntries() {
        this.events = [];

        this.tasksAssignedToUsers.forEach(
            task => {

                if ( !task.startDate || !task.endDate ) return;

                this.addEvent(
                    "Task: " + task.name + " " + "<br>" + "Priority: " + task.priority + " " + task.percentage +
                    "%<br>Members: &nbsp;" +
                    task.users.filter( u => this.team$.value?.members.includes( u ) ).join( ',&nbsp;&nbsp;' ),
                    task.startDate,
                    task.endDate,
                    false,
                    [],
                    colors.blue
                );
            }
        );

        this.unavailabilityTeamMemberPeriods.forEach(
            unavailablePeriod => {
                this.addEvent(
                    unavailablePeriod.user + " indisponivel",
                    unavailablePeriod.startDate,
                    unavailablePeriod.endDate,
                    false,
                    [],
                    colors.red
                );
            }
        )

        this.meetings?.forEach(
            meeting => {
                this.addEvent(
                    meeting.type === MeetingTypeEnum.TEAM ? "Reuni&atilde;o de equipa" : "Reuni&atilde;o",
                    meeting.startDate,
                    meeting.endDate,
                    false,
                    [],
                    colors.yellow
                );
            }
        )

        this.refresh.next();
    }

    public openOffCanvas( content: any ) {
        this.offcanvasService.open( content, { position: 'end' } );
    }

    public closeOffCanvas() {
        this.offcanvasService.dismiss();
        this.reload();
    }

    view: CalendarView = CalendarView.Month;

    CalendarView = CalendarView;

    viewDate: Date = new Date();

    modalData!: {
        action: string;
        event: CalendarEvent;
    };

    actions: CalendarEventAction[] = [];

    refresh = new Subject<void>();

    events: CalendarEvent[] = [];

    activeDayIsOpen: boolean = true;

    dayClicked( { date, events }: { date: Date; events: CalendarEvent[] } ): void {
        if ( isSameMonth( date, this.viewDate ) ) {
            this.activeDayIsOpen = !((isSameDay( this.viewDate, date ) && this.activeDayIsOpen) ||
                                     events.length === 0);
            this.viewDate = date;
        }
    }

    eventTimesChanged( {
                           event,
                           newStart,
                           newEnd,
                       }: CalendarEventTimesChangedEvent ): void {
        this.events = this.events.map( ( iEvent ) => {
            if ( iEvent === event ) {
                return {
                    ...event,
                    start: newStart,
                    end: newEnd,
                };
            }
            return iEvent;
        } );
        this.handleEvent( 'Dropped or resized', event );
    }

    handleEvent( action: string, event: CalendarEvent ): void {
        this.modalData = { event, action };
        this.modal.open( this.modalContent, { size: 'lg' } );
    }

    addEvent( title: string, start: Date, end: Date, draggable: boolean, actions: any[], color?: any, ): void {
        this.events = [
            ...this.events,
            {
                title: title,
                start: new Date( start ),
                end: new Date( end ),
                color: color,
                draggable: draggable,
                actions: actions
            },
        ];
    }

    deleteEvent( eventToDelete: CalendarEvent ) {
    }

    setView( view: CalendarView ) {
        this.view = view;
    }

    closeOpenMonthViewDay() {
        this.activeDayIsOpen = false;
    }

    unavailablePeriodEvent() {
        return this.events.filter( e => e.title === 'Indisponivel' );
    }

    saveColor( event: any, color: any, isPrimaryColor: boolean ) {

        if ( isPrimaryColor ) {
            localStorage.setItem( LocalStorageKeyEnum.CALENDAR_UNAVAILABILITY_EVENT_PRIMARY_COLOR, color );
        }
        else {
            localStorage.setItem( LocalStorageKeyEnum.CALENDAR_UNAVAILABILITY_EVENT_SECONDARY_COLOR, color );
        }

        this.reload();
    }

}
