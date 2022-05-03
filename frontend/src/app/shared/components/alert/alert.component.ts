import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Alert, AlertType } from "@core/models/alert.model";
import { NavigationStart, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AlertService } from "@core/services/alert/alert.service";
import { LoggerService } from "@core/services/logger/logger.service";

@Component( {
              selector: 'app-alert',
              templateUrl: './alert.component.html',
              styleUrls: [ './alert.component.css' ]
            } )
export class AlertComponent implements OnInit, OnDestroy {
  @Input() id = 'alert-default-id';
  @Input() isOnlyOne = false;
  @Input() isFaded = true;

  alerts: Alert[] = [];
  alertSubscription!: Subscription;
  routeSubscription!: Subscription;

  constructor( private router: Router ) { }

  ngOnInit() {
    // Subscribe to new alert notifications.
    this.alertSubscription =
      AlertService.onAlert( this.id )
                  .subscribe( alert => {
                    // Clear alerts when an empty alert is received.
                    if ( !alert.message ) {
                      // Filter out alerts without 'keepAfterRouteChange' flag.
                      this.alerts = this.alerts.filter( x => x.isKeptAfterRouteChange );

                      // Remove 'keepAfterRouteChange' flag on the rest.
                      // @ts-ignore
                      this.alerts.forEach( x => delete x.isKeptAfterRouteChange );
                      return;
                    }

                    LoggerService.info(
                      'Adding alert: ' + JSON.stringify( alert ),
                      LoggerService.setCaller( this, this.ngOnInit, this.alertSubscription )
                    );

                    if ( this.isOnlyOne ) {
                      this.alerts = [];
                    }

                    // Add alert to array.
                    this.alerts.push( alert );

                    // Auto close alert if required
                    if ( alert.isAutoClosed ) {
                      setTimeout( () => this.removeAlert( alert ), 5000 );
                    }
                  } );

    // Clear alerts on location change.
    this.routeSubscription = this.router.events.subscribe( ( event: any ) => {
      if ( event instanceof NavigationStart ) {
        AlertService.clear( this.id );
      }
    } );
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks.
    this.alertSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  removeAlert( alert: Alert ) {
    // Check if already removed to prevent error on auto close.
    if ( !this.alerts.includes( alert ) ) return;

    LoggerService.info( 'Removing alert ' + JSON.stringify( alert ), LoggerService.setCaller( this, this.removeAlert ) );

    if ( this.isFaded ) {
      // Fade out alert.
      const found = this.alerts.find( x => x === alert );
      if ( found ) found.isFaded = true;

      // Remove alert after faded out.
      setTimeout( () => {
        this.alerts = this.alerts.filter( x => x !== alert );
      }, 250 );
    }
    else {
      // Remove alert.
      this.alerts = this.alerts.filter( x => x !== alert );
    }
  }

  cssClass( alert: Alert ) {
    if ( !alert ) return;

    const classes = [ 'alert', 'alert-dismissable' ];

    if ( alert.hasAnimationShake ) {
      classes.push( 'animation-shake' );
    }

    const alertTypeClass = {
      [AlertType.Success]: 'alert-success',
      [AlertType.Error]: 'alert-danger',
      [AlertType.Info]: 'alert-info',
      [AlertType.Warning]: 'alert-warning'
    }

    classes.push( alertTypeClass[alert.type] );

    if ( alert.isFaded ) {
      classes.push( 'fade' );
    }

    return classes.join( ' ' );
  }
}
