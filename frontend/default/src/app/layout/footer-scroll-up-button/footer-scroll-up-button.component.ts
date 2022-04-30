import { Component, HostListener, OnInit } from '@angular/core';
import { MediaScreenSize } from "@core/enums/media.enum";

@Component( {
  selector: 'app-footer-scroll-up-button',
  templateUrl: './footer-scroll-up-button.component.html',
  styleUrls: [ './footer-scroll-up-button.component.css' ]
} )
export class FooterScrollUpButtonComponent implements OnInit {

  private _screenWidth!: number;
  private _isViewportMinWidth_576px!: boolean;
  private _isViewportMinWidth_768px!: boolean;

  constructor() {
    this.reloadViewportSizeVariables( window.innerWidth );
  }

  // HTML elements with dynamic css.
  private _ScrollUpElement!: HTMLElement;
  private _ScrollUpImageElement!: HTMLElement;

  ngOnInit(): void {
    this._ScrollUpElement = (document.getElementsByClassName( "scroll-up-button" )[0] as HTMLElement);
    this._ScrollUpImageElement = (document.getElementsByClassName( "scroll-up-button__image" )[0] as HTMLElement);

    this.hideScrollUpOnTop();
    this._styleArrowUp();
  }

  reloadViewportSizeVariables( screenWidth: number ) {
    this._screenWidth = screenWidth;
    this._isViewportMinWidth_576px = this._screenWidth >= MediaScreenSize.Width_576px;
    this._isViewportMinWidth_768px = this._screenWidth >= MediaScreenSize.Width_768px;
  }

  @HostListener( 'window:scroll', [ '$event' ] )
  hideScrollUpOnTop() {
    if ( window.scrollY < 50 ) {
      this._ScrollUpElement.style.display = "none";
    }
    else {
      this._ScrollUpElement.style.display = "";
    }
  }

  @HostListener( 'window:resize', [ '$event' ] )
  onResizeHandler( event: { target: { innerWidth: any; innerHeight: any; }; } ) {
    this.reloadViewportSizeVariables( event.target.innerWidth );

    this._styleArrowUp();
  }

  public smoothScroll() {
    window.scrollTo( {
      top: 0,
      behavior: 'smooth'
    } )
  }

  private _styleArrowUp() {

    if ( this._isViewportMinWidth_768px ) {
      this._ScrollUpImageElement.style.maxHeight = "50px";
      this._ScrollUpElement.style.bottom = "30px";
      this._ScrollUpElement.style.right = "30px";
    }
    else if ( this._isViewportMinWidth_576px ) {
      this._ScrollUpImageElement.style.maxHeight = "40px";
      this._ScrollUpElement.style.bottom = "20px";
      this._ScrollUpElement.style.right = "20px";
    }
    else {
      this._ScrollUpImageElement.style.maxHeight = "30px";
      this._ScrollUpElement.style.bottom = "10px";
      this._ScrollUpElement.style.right = "10px";
    }
  }
}
