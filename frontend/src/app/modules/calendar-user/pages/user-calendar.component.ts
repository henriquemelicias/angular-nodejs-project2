import {
    Component,
    ChangeDetectionStrategy,
    ViewChild,
    TemplateRef, OnInit,
} from '@angular/core';
import {
    startOfDay,
    endOfDay,
    subDays,
    addDays,
    endOfMonth,
    isSameDay,
    isSameMonth,
    addHours,
} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import {
    CalendarEvent,
    CalendarEventAction,
    CalendarEventTimesChangedEvent,
    CalendarView,
} from 'angular-calendar';
import { ActivatedRoute } from "@angular/router";
import { UserService } from "@data/user/services/user.service";

const colors: any = {
    red: {
        primary: '#ad2121',
        secondary: '#FAE3E3',
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

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any> | undefined;

  thisCalendarUser;
  sessionUser;

  constructor(private modal: NgbModal, private route: ActivatedRoute, private offcanvasService: NgbOffcanvas ) {
      console.log( route.snapshot.paramMap.get( 'username' ) );
      this.thisCalendarUser = route.snapshot.paramMap.get( 'username' );
      this.sessionUser = UserService.sessionUser;
  }

  ngOnInit(): void {
    const radioButtons = document.getElementsByClassName('overview__buttons__btn');
    const calHeaders = document.getElementsByClassName( 'cal-header' );

    if ( calHeaders )
    {
        for ( let i = 0; i < calHeaders.length; i++ ) {
            const calHeaderElement = calHeaders[i] as HTMLElement;
            calHeaderElement.tabIndex = -1;
        }
    }

    if ( radioButtons )
    {
      for ( let i = 0; i < radioButtons.length; i++ )
      {
        const radioButtonElement = radioButtons[i] as HTMLElement;
        radioButtonElement.addEventListener( 'focusin', function() {
          const dialogBoxContainerElement = document.createElement( 'div');
          dialogBoxContainerElement.setAttribute( 'id',  'radio-buttons-use-arrow-keys-popup-dialog');
          dialogBoxContainerElement.setAttribute( 'style', "position: relative; width: 0; height: 0;");

          const dialogBoxElement = document.createElement( 'div' );
          dialogBoxElement.innerHTML = "Use&nbsp;arrow&nbsp;keys";
          dialogBoxElement.setAttribute( 'style', 'position: absolute; bottom: 2.8rem; left:5rem; font-size:1.2rem; color: var( --font-color-highlight) ' );
          dialogBoxContainerElement.appendChild( dialogBoxElement );

          // @ts-ignore
          radioButtonElement.parentElement.appendChild( dialogBoxContainerElement );
        });
        radioButtonElement.addEventListener( 'focusout', function() {
          const arrowKeysPopupDialogElement = document.getElementById('radio-buttons-use-arrow-keys-popup-dialog') as HTMLElement;
          // @ts-ignore
          arrowKeysPopupDialogElement.parentElement.removeChild( arrowKeysPopupDialogElement );
        })
      }
    }
  }

    public reload() {
        // this.getNumberOfProjects();
        // this.projectService.loadProjectsByPage( this.currentPage );
    }

    public openOffCanvas( content: any ) {
        this.offcanvasService.open( content, { position: 'end' } );
    }

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
               action: string;
               event: CalendarEvent;
             } | undefined;

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh = new Subject<void>();

  events: CalendarEvent[] = [
    {
      start: subDays(startOfDay(new Date()), 1),
      end: addDays(new Date(), 1),
      title: 'A 3 day event',
      color: colors.red,
      actions: this.actions,
      allDay: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
    {
      start: startOfDay(new Date()),
      title: 'An event with no end date',
      color: colors.yellow,
      actions: this.actions,
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'A long event that spans 2 months',
      color: colors.blue,
      allDay: true,
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: addHours(new Date(), 2),
      title: 'A draggable and resizable event',
      color: colors.yellow,
      actions: this.actions,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
  ];

  activeDayIsOpen: boolean = true;

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = !((isSameDay( this.viewDate, date ) && this.activeDayIsOpen) ||
                               events.length === 0);
      this.viewDate = date;
    }
  }

  eventTimesChanged({
                      event,
                      newStart,
                      newEnd,
                    }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
}