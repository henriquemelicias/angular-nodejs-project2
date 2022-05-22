import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild, } from '@angular/core';
import { isSameDay, isSameMonth } from 'date-fns';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView, } from 'angular-calendar';
import { ActivatedRoute } from "@angular/router";
import { UserService } from "@data/user/services/user.service";
import { UserSchema } from "@data/user/schemas/user.schema";
import { AlertService } from "@core/services/alert/alert.service";
import { AlertType } from "@core/models/alert.model";
import { TaskSchema } from "@data/task/schemas/task.schema";
import { TaskService } from "@data/task/services/task.service";
import { LocalStorageKeyEnum } from "@core/enums/local-storage-key.enum";

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

@Component(
    {
        selector: 'app-pages-user',
        changeDetection: ChangeDetectionStrategy.OnPush,
        templateUrl: './user-calendar.component.html',
        styleUrls: [ './user-calendar.component.css' ]
    } )
export class UserCalendarComponent implements OnInit {

    @ViewChild( 'modalContent', { static: true } ) modalContent: TemplateRef<any> | undefined;

    user$: BehaviorSubject<UserSchema | undefined> = new BehaviorSubject<UserSchema | undefined>( undefined )
    tasksAssignedToUser!: TaskSchema[];
    username: string;
    sessionUser;

    constructor( private modal: NgbModal,
                 private route: ActivatedRoute,
                 private offcanvasService: NgbOffcanvas,
                 private userService: UserService,
                 private taskService: TaskService ) {
        // @ts-ignore
        this.username = route.snapshot.paramMap.get( 'username' );
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
                new Promise( ( resolve, reject ) => this.userService.getUserByUsername( this.username ).subscribe(
                    {
                        next: user => {
                            this.user$.next( user );
                            resolve( resolve );
                        },
                        error: error => {
                            AlertService.alertToApp( AlertType.Error, error, { isCloseable: true } );
                            reject( error );
                        },
                    } )
                ),
                new Promise( ( resolve, reject ) => this.taskService.getTasksWithPeriodAssignedToUser( this.username )
                                                        .subscribe(
                                                            {
                                                                next: tasks => {
                                                                    this.tasksAssignedToUser = tasks;
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
                                                        ) )
            ]
        ).then( () => this._changeCalendarEntries() );
    }

    private _changeCalendarEntries() {
        this.events = [];

        this.user$.value?.unavailableTimes.forEach(
            time => {
                const eventColors = {
                    primary: localStorage.getItem( LocalStorageKeyEnum.CALENDAR_UNAVAILABILITY_EVENT_PRIMARY_COLOR ) ||
                             colors.red.primary,
                    secondary: localStorage.getItem( LocalStorageKeyEnum.CALENDAR_UNAVAILABILITY_EVENT_SECONDARY_COLOR ) ||
                               colors.red.secondary,
                }
                this.addEvent( 'Indisponivel', time.startDate, time.endDate, false, [], eventColors );
            }
        );

        this.tasksAssignedToUser.forEach(
            task => {

                if ( !task.startDate || !task.endDate ) return;

                this.addEvent(
                    task.name + " " + " " + task.priority + " " + task.percentage + "%",
                    task.startDate,
                    task.endDate,
                    false,
                    [],
                    colors.blue
                );
            }
        );

        this.refresh.next();
    }

    public openOffCanvas( content: any ) {
        this.offcanvasService.open( content, { position: 'end' } );
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
        if ( this.user$.value ) {
            const user = {
                ...this.user$.value
            }
            user.unavailableTimes = user.unavailableTimes.filter( event => {
                return new Date( event.startDate ).getDate() !== new Date( eventToDelete.start ).getDate() ||
                new Date( event.endDate ).getDate() !== ( eventToDelete.end ? new Date( eventToDelete.end ).getDate() : undefined ) ||
                eventToDelete.title !== "Indisponivel";
            } );
            this.events = this.events.filter( ( event ) => event !== eventToDelete );
            this.userService.updateUser( user ).subscribe(
                {
                    next: user => {
                        this.user$.next( user );
                        this.refresh.next();
                    }
                } )
        }
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