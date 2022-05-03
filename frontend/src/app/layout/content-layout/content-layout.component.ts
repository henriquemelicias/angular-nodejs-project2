import { Component, OnInit } from '@angular/core';
import { environment } from "@env/environment";
import { LoggerService } from "@core/services/logger/logger.service";

@Component( {
              selector: 'app-content-layout',
              templateUrl: './content-layout.component.html',
              styleUrls: [ './content-layout.component.css' ]
            } )
export class ContentLayoutComponent implements OnInit {

  constructor( ) {
  }

  ngOnInit(): void {
    if ( !environment.production ) {
      LoggerService.info( "Logger is enabled (switch to production mode to disable).",
                          LoggerService.setCaller( this, this.ngOnInit ) );
    }
  }

}
