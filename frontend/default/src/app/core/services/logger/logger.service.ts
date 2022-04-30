import { Injectable, OnInit } from '@angular/core';
import { environment }        from "@env/environment";

@Injectable( {
               providedIn: 'root'
             } )
export class LoggerService implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

  static debug( message: string, caller: string = '' ) {
    if ( environment.production ) return;
    const logEntry = LoggerService._createLogStatement( "debug", message, caller );
    console.debug( logEntry );
    return logEntry;
  }

  static error( message: string, caller: string = '' ) {
    if ( environment.production ) return;
    const logEntry = LoggerService._createLogStatement( "error", message, caller );
    console.error( logEntry );
    return logEntry;
  }

  static info( message: string, caller: string = '' ) {
    if ( environment.production ) return;
    const logEntry = LoggerService._createLogStatement( "info", message, caller );
    console.info( logEntry );
    return logEntry;
  }

  static warn( message: string, caller: string = '' ) {
    if ( environment.production ) return;
    const logEntry = LoggerService._createLogStatement( "warn", message, caller );
    console.warn( logEntry );
    return logEntry;
  }

  private static _createLogStatement( level: string, message: string, caller: string ) {
    return "[" + level + "] " + LoggerService._getCurrentDate() + " " + caller + ' -> ' + message;
  }

  private static _getCurrentDate() {
    const dateNow = new Date();
    return "[" + dateNow.toLocaleString() + "]";
  }

  public static setCaller( ...args: any ): string {
    return args.map( ( a: any ) => {

      let result = 'Unknown';
      if ( typeof a === 'string' ) {
        result = a;
      }
      else if ( a.name  ) {
        result = a.name;
      }
      else if ( Object.getPrototypeOf( a ).constructor.name ) {
        result = Object.getPrototypeOf( a ).constructor.name;
      }

      return result;
    } ).join( '.' );
  }
}
