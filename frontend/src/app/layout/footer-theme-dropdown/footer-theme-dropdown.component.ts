import { Component } from '@angular/core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { ThemeSwitcherService } from "@core/services/theme-switcher/theme-switcher.service";
import { Theme } from "@core/constants/theme.const";

@Component( {
  selector: 'app-footer-theme-dropdown',
  templateUrl: './footer-theme-dropdown.component.html',
  styleUrls: [ './footer-theme-dropdown.component.css' ],
  providers: [ NgbDropdownConfig ]
} )
export class FooterThemeDropdownComponent {

  availableThemes: Theme[] = this.themeSwitcherService.getAvailableThemes();

  constructor( config: NgbDropdownConfig, private themeSwitcherService: ThemeSwitcherService ) {
    // customize default values of dropdowns used by this component tree
    config.placement = 'top-center';
  }

  changeTheme( theme: Theme ) {
    this.themeSwitcherService.changeTheme( theme );
  }

}
