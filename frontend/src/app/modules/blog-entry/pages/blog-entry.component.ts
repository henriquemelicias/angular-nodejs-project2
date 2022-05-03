import { Component, OnInit } from '@angular/core';

import { LightboxService } from '@core/services/lightbox/lightbox.service';

@Component( {
  selector: 'app-login',
  templateUrl: './blog-entry.component.html',
  styleUrls: [ './blog-entry.component.css' ]
} )
export class BlogEntryComponent implements OnInit {
  test: any = {
    date: "2022 March 20",
    title: "Blog Test",
    summary: "This is a test blog page.",
    sectionTitle: "The first section",
    sectionSubtitle: "by me"
  }

  constructor( private lightboxService: LightboxService ) {
  }

  ngOnInit(): void {
    const lightboxSelectables = document.getElementsByClassName( "img-lightbox-selectable" );
    for ( let i = 0; i < lightboxSelectables.length; i++ ) {
      const lightboxSelectableElement = lightboxSelectables[i] as HTMLElement;
      lightboxSelectableElement.addEventListener( "click", this.enableLightbox.bind( this ), false );
    }
  }

  private enableLightbox( $event: Event ) {
    const element = $event.currentTarget as HTMLImageElement;
    const imageSrc = element.getAttribute( "src" );

    if ( imageSrc ) {
      this.lightboxService.callLightboxComponentFunction( this.lightboxService.getFunctions().ChangeImage, [ imageSrc ] );
      this.lightboxService.callLightboxComponentFunction( this.lightboxService.getFunctions().EnableLightbox )
    }
  }


}
