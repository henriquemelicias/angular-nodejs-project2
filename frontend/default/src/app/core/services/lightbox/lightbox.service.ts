import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject }    from "rxjs";

import { LightboxFunctionEnum } from "@layout//lightbox/lightbox.component";

import { LoggerService } from "@core/services/logger/logger.service";

@Injectable( {
               providedIn: 'root'
             } )
export class LightboxService implements OnInit {

  private _messageSource$ = new BehaviorSubject( { fn: LightboxFunctionEnum.NULL, args: [ "" ] } );
  currentMessage$ = this._messageSource$.asObservable();

  public isLightboxEnabled = false;

  constructor() {
  }

  ngOnInit() {
  }

  public callLightboxComponentFunction( fn: LightboxFunctionEnum, args?: string[] ) {
    if ( fn == LightboxFunctionEnum.EnableLightbox ) {
      this.isLightboxEnabled = true;
    }
    else if ( fn == LightboxFunctionEnum.DisableLightbox ) this.isLightboxEnabled = false;

    if ( args == undefined ) args = [];

    LoggerService.info( "Function: " + fn + (args ? " Args: " + args : ""),
                        LoggerService.setCaller( this, this.callLightboxComponentFunction ) );
    this._messageSource$.next( { fn, args } );
  }

  public getFunctions() {
    return LightboxFunctionEnum;
  }
}
