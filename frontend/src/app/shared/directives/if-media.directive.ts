import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive( {
  selector: '[ifMedia]'
} )
export class IfMediaDirective {

  @Input() set ifMedia( query: string ) {
    // Clean old listener.
    if ( this.removeListener ) {
      this.removeListener();
    }

    this.setListener( query );
  }


  private hasView = false;
  private removeListener: (() => void) | undefined;

  constructor(
    private readonly viewContainer: ViewContainerRef,
    private readonly template: TemplateRef<any> ) {}

  private setListener( query: string ) {
    const mediaQueryList = window.matchMedia( query );
    const listener = (event: any) => {
      // Create view if true and not created already.
      if ( event.matches && !this.hasView ) {
        this.hasView = true;
        this.viewContainer.createEmbeddedView( this.template );
      }

      // Destroy view if false and created already.
      if ( !event.matches && this.hasView ) {
        this.hasView = false;
        this.viewContainer.clear();
      }
    };

    // Run once and add listener.
    listener( mediaQueryList );
    mediaQueryList.addEventListener( 'change', listener );


    // Cleanup listener.
    this.removeListener = () => removeEventListener('change', listener );
  }

}
