import { Injectable } from '@angular/core';
import { Theme, DEFAULT_THEME, DARK, BLOOD } from "@core/constants/theme.const";
import { LoggerService } from "@core/services/logger/logger.service";
import { LocalStorageKeyEnum } from "@core/enums/local-storage-key.enum";

@Injectable( {
               providedIn: 'root'
             } )
export class ThemeSwitcherService {

  public static activeTheme: Theme = DEFAULT_THEME;
  private static _availableThemes: Theme[] = [ BLOOD, DARK ];

  constructor() {
    // If there's a saved theme by the user, change to that theme.
    const themeName = localStorage.getItem( LocalStorageKeyEnum.COLOR_THEME );

    if ( themeName !== null ) {

      for ( let i = 0; i < ThemeSwitcherService._availableThemes.length; i++ ) {

        if ( ThemeSwitcherService._availableThemes[i].name == themeName ) {

          LoggerService.info( "Saved theme found: " + themeName, LoggerService.setCaller( this, 'constructor' ) );
          ThemeSwitcherService.activeTheme = ThemeSwitcherService._availableThemes[i];
        }
      }
    }

    this.changeTheme( ThemeSwitcherService.activeTheme );
  }

  getAvailableThemes(): Theme[] {
    return ThemeSwitcherService._availableThemes;
  }

  changeTheme( theme: Theme ) {
    // Save theme.
    localStorage.setItem( LocalStorageKeyEnum.COLOR_THEME, theme.name );

    ThemeSwitcherService.activeTheme = theme;

    Object.keys( ThemeSwitcherService.activeTheme.properties ).forEach( property => {
      document.documentElement.style.setProperty(
        property,
        ThemeSwitcherService.activeTheme.properties[property]
      );
    } );

    LoggerService.info( "Theme changed to: " + theme.name, LoggerService.setCaller( this, this.changeTheme ) );
  }
}
