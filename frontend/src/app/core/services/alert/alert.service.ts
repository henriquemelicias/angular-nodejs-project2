import { Injectable }                  from '@angular/core';
import { filter, Observable, Subject } from "rxjs";
import { LoggerService } from "@core/services/logger/logger.service";

import { Alert, AlertType } from "@core/models/alert.model";

@Injectable( {
               providedIn: 'root'
             } )
export class AlertService {

  private static _subject$ = new Subject<Alert>();
  private static _DEFAULT_ID = 'alert-default-id';

  // Enable subscribing to alert observable.
  static onAlert( id = AlertService._DEFAULT_ID ): Observable<Alert> {
    return AlertService._subject$.asObservable().pipe( filter( x => x && x.id === id ) );
  }

  // Convenience methods.
  static success( message: string, options?: any, caller?: string ) {
    AlertService._alert( new Alert( { ...options, type: AlertType.Success, message } ) );

    if ( caller ) LoggerService.info( message, caller );
  }

  static error( message: string, options?: any, caller?: string ) {
    AlertService._alert( new Alert( { ...options, type: AlertType.Error, message } ) );

    if ( caller ) LoggerService.error( message, caller );
  }

  static info( message: string, options?: any, caller?: string ) {
    AlertService._alert( new Alert( { ...options, type: AlertType.Info, message } ) );

    if ( caller ) LoggerService.info( message, caller );
  }

  static warn( message: string, options?: any, caller?: string ) {
    AlertService._alert( new Alert( { ...options, type: AlertType.Warning, message } ) );

    if ( caller ) LoggerService.warn( message, caller );
  }

  static chooseMethod( type: AlertType, message: string, options?: any, caller?: string ) {
    switch ( type ) {
      case AlertType.Success:
        this.success( message, options, caller );
        break;
      case AlertType.Info:
        this.info( message, options, caller );
        break;
      case AlertType.Warning:
        this.warn( message, options, caller );
        break;
      case AlertType.Error:
        this.error( message, options, caller );
        break;
      default:
        break;
    }
  }

  // Methods used a lot turned into functions.
  static alertToApp( type: AlertType, message: string, options?: any, caller?: string ) {
    if ( options && !options.id )
    {
      options.id = 'alert-content-layout';
    }

    this.chooseMethod( type, message, options || { id: 'alert-content-layout', isCloseable: true }, caller );
  }

  // Main alert method.
  private static _alert( alert: Alert ) {
    alert.id = alert.id || AlertService._DEFAULT_ID;
    AlertService._subject$.next( alert );
  }

  // Clear alerts.
  static clear( id = AlertService._DEFAULT_ID ) {
    AlertService._subject$.next( new Alert( { id } ) );
  }
}
