import { Component, OnInit } from '@angular/core';

import { LightboxService } from "@core/services/lightbox/lightbox.service";
import { LoggerService }   from "@core/services/logger/logger.service";
import { Subscription } from "rxjs";

const LightboxComponentFn: { [fn: string]: any } = {};

export enum LightboxFunctionEnum {
  NULL = "",
  ChangeImage = "changeImage",
  EnableLightbox = "enableLightbox",
  DisableLightbox = "disableLightbox",

}

@Component( {
              selector: 'app-lightbox',
              templateUrl: './lightbox.component.html',
              styleUrls: [ './lightbox.component.css' ]
            } )
export class LightboxComponent implements OnInit {

  private lightboxServiceSubscription!: Subscription;

  private isFullscreen = false;
  private readonly isFirefox: any;
  private isNonTouchGrabEventRunning = false;

  // Constants.
  private MOUSE_CLICK_DELTA = 5;
  private MIN_IMAGE_ZOOM_SCALE = 0.05;
  private MAX_IMAGE_ZOOM_SCALE = 30.0;
  private IMAGE_SCALE_MIN_DIFF = 0.1;
  private IMAGE_WHEEL_SCALE_FACTOR = 0.003;

  // Movement factors.
  private imageScale = 1.0;
  private previousImageScale = 1.0;
  private imageLeft_px = 0;
  private imageTop_px = 0;

  /*
   * Touch actions variables.
   */
  private IMAGE_TOUCH_ACTION_SCALE_FACTOR = 0.0002;
  private IMAGE_TOUCH_ACTION_MOVE_FACTOR = 1;


  // Global vars to cache event state.
  private pointerEventCache = new Array<PointerEvent>();
  private previousPointerEventFingerPosition = { x: -1, y: -1 };
  private initialPointerEventPinchFingersDistance = -1;
  private previousPointerEventPinchFingersDistance = -1;
  private isOneFingerPointerEventLocked = false;

  constructor( private lightboxService: LightboxService ) {

    // Save function calls to object, so we can call the function with the string.
    LightboxComponentFn["changeImage"] = this.changeImage;
    LightboxComponentFn["enableLightbox"] = this.enableLightbox;
    LightboxComponentFn["disableLightbox"] = this.disableLightbox;

    // Wait for a message from service (thus from another component).
    this.lightboxServiceSubscription = this.lightboxService.currentMessage$.subscribe( message => {
      if ( message.fn != LightboxFunctionEnum.NULL ) {
        this.execFn( LightboxComponentFn[message.fn], message.args );
      }
    } );

    // Firefox fix for dragEvent not showing clientX and clientY (as all the other browsers).
    // by codesmith32
    // https://bugzilla.mozilla.org/show_bug.cgi?id=505521
    if ( /Firefox\/\d+[\d]*/.test( navigator.userAgent ) ) {
      this.isFirefox = true;
      if ( typeof window.DragEvent === 'function'
           && typeof window.addEventListener === 'function' ) {
        (function () {
          // @ts-ignore
          let cx: any, cy: any, px: any, py: any, ox: any, oy: any, sx: any, sy: any, lx: any, ly: any;

          function update( e: any ) {
            cx = e.clientX;
            cy = e.clientY;
            px = e.pageX;
            py = e.pageY;
            ox = e.offsetX;
            oy = e.offsetY;
            sx = e.screenX;
            sy = e.screenY;
            lx = e.layerX;
            ly = e.layerY;
          }

          function assign( e: any ) {
            e._ffix_cx = cx;
            e._ffix_cy = cy;
            e._ffix_px = px;
            e._ffix_py = py;
            e._ffix_ox = ox;
            e._ffix_oy = oy;
            e._ffix_sx = sx;
            e._ffix_sy = sy;
            e._ffix_lx = lx;
            e._ffix_ly = ly;
          }

          window.addEventListener( 'mousemove', update, true );
          window.addEventListener( 'dragover', update, true );
          // bug #505521 identifies these three listeners as problematic:
          // (although tests show 'dragstart' seems to work now, keep to be compatible)
          window.addEventListener( 'dragstart', assign, true );
          window.addEventListener( 'drag', assign, true );
          window.addEventListener( 'dragend', assign, true );

          const me = Object.getOwnPropertyDescriptors( window.MouseEvent.prototype ),
            ue = Object.getOwnPropertyDescriptors( window.UIEvent.prototype );

          function getter( prop: string, repl: string ) {
            return function () { // @ts-ignore
              return me[prop] && me[prop].get.call( this ) || Number( this[repl] ) || 0
            };
          }

          function layerGetter( prop: string, repl: string ) {
            return function () { // @ts-ignore
              return this.type === 'dragover' && ue[prop] ? ue[prop].get.call( this ) : (Number( this[repl] ) || 0)
            };
          }

          Object.defineProperties( window.DragEvent.prototype, {
            clientX: { get: getter( 'clientX', '_ffix_cx' ) },
            clientY: { get: getter( 'clientY', '_ffix_cy' ) },
            pageX: { get: getter( 'pageX', '_ffix_px' ) },
            pageY: { get: getter( 'pageY', '_ffix_py' ) },
            offsetX: { get: getter( 'offsetX', '_ffix_ox' ) },
            offsetY: { get: getter( 'offsetY', '_ffix_oy' ) },
            screenX: { get: getter( 'screenX', '_ffix_sx' ) },
            screenY: { get: getter( 'screenY', '_ffix_sy' ) },
            x: { get: getter( 'x', '_ffix_cx' ) },
            y: { get: getter( 'y', '_ffix_cy' ) },
            layerX: { get: layerGetter( 'layerX', '_ffix_lx' ) },
            layerY: { get: layerGetter( 'layerY', '_ffix_ly' ) }
          } );
        })();
      }
    }
  }

  bodyElement!: HTMLElement; // to disable overflow
  lightboxElement!: HTMLElement;
  imageWrapperElement!: HTMLElement;
  imageElement!: HTMLElement;

  ngOnInit(): void {
    this.bodyElement = document.getElementsByTagName( "body" )[0] as HTMLElement;
    this.lightboxElement = document.getElementById( "lightbox" ) as HTMLElement;
    this.imageWrapperElement = this.lightboxElement.children[0] as HTMLElement;
    this.imageElement = this.imageWrapperElement.children[0] as HTMLElement;

    this.imageLeft_px = this.imageElement.offsetLeft;
    this.imageTop_px = this.imageElement.offsetTop;
  }

  private mouseClickListener() {
    LoggerService.info( "Enabled mouse click listeners.", LoggerService.setCaller( this, this.mouseClickListener ) );

    let startX: number;
    let startY: number;
    const mouseClickDelta = this.MOUSE_CLICK_DELTA;
    const _this = this;

    function onMouseClickDown( event: MouseEvent ) {
      startX = event.pageX;
      startY = event.pageY;
    }

    function onMouseClickUp( event: MouseEvent ) {
      const diffX = Math.abs( event.pageX - startX );
      const diffY = Math.abs( event.pageY - startY );

      if ( diffX < mouseClickDelta && diffY < mouseClickDelta ) {
        LoggerService.info( "Disabled mouse click listeners.",
                            LoggerService.setCaller( _this, _this.mouseClickListener, onMouseClickUp ) );
        document.removeEventListener( 'mousedown', onMouseClickDown, false );
        document.removeEventListener( 'mouseup', onMouseClickUp, false );
        _this.disableLightbox();
      }
    }

    document.addEventListener( 'mousedown', onMouseClickDown, { passive: true } );
    document.addEventListener( 'mouseup', onMouseClickUp, { passive: true } );
  }

  private changeImage( imageSrc: string ) {
    LoggerService.info( "Lightbox image has been changed to: " + imageSrc,
                        LoggerService.setCaller( this, this.changeImage ) );
    this.imageElement.setAttribute( "src", imageSrc );
  }

  private enableLightbox() {
    LoggerService.info( "Lightbox enabled.", LoggerService.setCaller( this, this.enableLightbox ) );
    this.mouseClickListener();
    this.bodyElement.classList.add( "no-overflow" );
    this.lightboxElement.classList.remove( "hidden" );

    document.documentElement.requestFullscreen().then( _ => this.isFullscreen = true );
  }

  private disableLightbox() {
    LoggerService.info( "Lightbox disabled.", LoggerService.setCaller( this, this.disableLightbox ) );
    this.bodyElement.classList.remove( "no-overflow" );
    this.lightboxElement.classList.add( "hidden" );

    // Reset image settings.
    this.imageScale = 1.0;
    this.imageLeft_px = 0;
    this.imageTop_px = 0;

    this.changeImagePosition( 0, 0 );
    this.updateImageScale( 0 );

    this.previousImageScale = 1.0;

    document.exitFullscreen().then( _ => this.isFullscreen ).catch( _ => this.isFullscreen = !this.isFullscreen );
  }

  private changeImagePosition( left: number, top: number ) {
    requestAnimationFrame( () => {
      this.imageWrapperElement.style.left = left + "px";
      this.imageWrapperElement.style.top = top + "px";
      LoggerService.info( "{ Left: " + left + "px, Top: " + top + "px }",
                          LoggerService.setCaller( this, this.changeImagePosition ) );
    } );
  }

  private updateImageScale( minScaleDiff: Number = this.IMAGE_SCALE_MIN_DIFF ) {
    if ( this.MIN_IMAGE_ZOOM_SCALE >= this.imageScale ) {
      this.imageScale = this.MIN_IMAGE_ZOOM_SCALE;
    }
    else if ( this.imageScale >= this.MAX_IMAGE_ZOOM_SCALE ) {
      this.imageScale = this.MAX_IMAGE_ZOOM_SCALE;
    }
    else {
      if ( Math.abs( (this.imageScale - this.previousImageScale) / this.previousImageScale ) > minScaleDiff ) {
        this.imageWrapperElement.style.transform = `scale(${ this.imageScale })`;
        this.previousImageScale = this.imageScale;
        LoggerService.info( "Scale: " + this.imageScale, LoggerService.setCaller( this, this.updateImageScale ) );
      }
    }

  }

  onDragEvent( $event: DragEvent ) {
    $event.preventDefault();
  }

  onGrabStartEvent( $event: DragEvent ) {
    this.isNonTouchGrabEventRunning = true;

    // Remove firefox cursor icon change on drag.
    if ( this.isFirefox ) {
      $event.preventDefault();
    }

    // Prevent drag image ghost.
    if ( $event.dataTransfer !== null ) {
      $event.dataTransfer.setDragImage( new Image(), 0, 0 );
    }

    this.lightboxElement.style.cursor = "grabbing";
  }

  onGrabEndEvent() {
    this.isNonTouchGrabEventRunning = false;
    this.lightboxElement.style.cursor = "grab";
  }

  onWheelEvent( $event: WheelEvent ) {
    $event.preventDefault();

    this.imageScale -= this.IMAGE_WHEEL_SCALE_FACTOR * this.imageScale * $event.deltaY;
    this.updateImageScale();
  }

  // This is the method that performs the execution of functions.
  private execFn( fn: any, args: string[] ) {
    return fn.apply( this, args );
  }

  /* https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures */

  onPointerDownEvent( $event: PointerEvent ) {
    LoggerService.info( "Pointer down event started.", LoggerService.setCaller( this, this.onPointerDownEvent ) );
    this.pointerEventCache.push( $event );
    this.previousPointerEventFingerPosition = { x: $event.x, y: $event.y };
  }

  onPointerMoveEvent( $event: PointerEvent ) {
    $event.preventDefault();
    // This function implements a 2-pointer horizontal pinch/zoom gesture.
    //
    // If the distance between the two pointers has increased (zoom in),
    // the target element's background is changed to "pink" and if the
    // distance is decreasing (zoom out), the color is changed to "lightblue".
    //
    // This function sets the target element's border to "dashed" to visually
    // indicate the pointer's target received a move event.
    // log("pointerMove", ev);
    if ( $event.target == null ) return;

    // Find this event in the cache and update its record with this event
    for ( let i = 0; i < this.pointerEventCache.length; i++ ) {
      if ( $event.pointerId == this.pointerEventCache[i].pointerId ) {
        this.pointerEventCache[i] = $event;
        break;
      }
    }

    // Only one pointer is down.
    if ( this.pointerEventCache.length == 1 && !this.isOneFingerPointerEventLocked ) {
      // Calculate the distance between the new point and the initial position
      const xDiff = this.pointerEventCache[0].x - this.previousPointerEventFingerPosition.x;
      const yDiff = this.pointerEventCache[0].y - this.previousPointerEventFingerPosition.y;

      this.previousPointerEventFingerPosition.x = this.pointerEventCache[0].x;
      this.previousPointerEventFingerPosition.y = this.pointerEventCache[0].y;

      this.imageLeft_px += xDiff * this.IMAGE_TOUCH_ACTION_MOVE_FACTOR;
      this.imageTop_px += yDiff * this.IMAGE_TOUCH_ACTION_MOVE_FACTOR;

      this.changeImagePosition( this.imageLeft_px, this.imageTop_px );
    }

    // If two pointers are down, check for pinch gestures
    if ( this.pointerEventCache.length == 2 ) {
      this.isOneFingerPointerEventLocked = true;
      // Calculate the distance between the two pointers
      const xSection = Math.pow( this.pointerEventCache[0].clientX - this.pointerEventCache[1].clientX, 2 );
      const ySection = Math.pow( this.pointerEventCache[0].clientY - this.pointerEventCache[1].clientY, 2 );
      const currentDistance = Math.sqrt( xSection + ySection );

      if ( this.initialPointerEventPinchFingersDistance == -1 ) {
        this.initialPointerEventPinchFingersDistance = currentDistance;
      }

      const scaleFactor = Math.abs( currentDistance - this.initialPointerEventPinchFingersDistance ) *
                          this.IMAGE_TOUCH_ACTION_SCALE_FACTOR;

      if ( this.previousPointerEventPinchFingersDistance > 0 ) {
        if ( currentDistance > this.previousPointerEventPinchFingersDistance ) {
          // The distance between the two pointers has increased
          // log("Pinch moving OUT -> Zoom in", $event);
          this.imageScale += scaleFactor * this.imageScale;
        }
        if ( currentDistance < this.previousPointerEventPinchFingersDistance ) {
          // The distance between the two pointers has decreased
          // log("Pinch moving IN -> Zoom out",$event);
          this.imageScale -= scaleFactor * this.imageScale;
        }

        this.updateImageScale();
      }

      // Cache the distance for the next move event
      this.previousPointerEventPinchFingersDistance = currentDistance;
    }
  }

  onPointerUpEvent( $event: PointerEvent ) {
    if ( $event.target == null ) return;
    const _this = this;

    // Remove this pointer from the cache and reset the target's
    function remove_event( $event: PointerEvent ) {
      // Remove this event from the target's cache
      for ( let i = 0; i < _this.pointerEventCache.length; i++ ) {
        if ( _this.pointerEventCache[i].pointerId == $event.pointerId ) {
          _this.pointerEventCache.splice( i, 1 );
          break;
        }
      }
    }

    remove_event( $event );

    // If the number of pointers down is less than two then reset diff tracker
    if ( this.pointerEventCache.length < 2 ) {
      this.previousPointerEventPinchFingersDistance = -1;
      this.initialPointerEventPinchFingersDistance = -1;
      this.previousPointerEventPinchFingersDistance = -1;
    }

    if ( this.pointerEventCache.length == 0 ) {
      this.isOneFingerPointerEventLocked = false;
    }
  }

  ngOnDestroy() {
    this.lightboxServiceSubscription.unsubscribe();
  }
}
