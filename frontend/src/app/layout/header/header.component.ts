import { Component, HostListener, OnInit } from '@angular/core';

import { MediaScreenSize } from "@core/enums/media.enum";
import { AuthService } from "@core/services/auth/auth.service";
import { ModalComponent } from "@shared/components/modal/modal.component";
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { UserService } from "@data/user/services/user.service";
import { LoggerService } from "@core/services/logger/logger.service";
import { Subscription } from 'rxjs';

@Component( {
                selector: 'app-header',
                templateUrl: './header.component.html',
                styleUrls: [ './header.component.css' ]
            } )
export class HeaderComponent implements OnInit {

    modalRef: MdbModalRef<ModalComponent> | null = null; // logout modal
    navItems!: { link: string; routerLink: string; title: string; isVisible: boolean; }[];

    public isLoggedIn = false;
    public isAdmin = false;
    private _sessionUserSubscription!: Subscription;

    private _screenWidth: number;

    public isViewportMinWidth_576px: boolean;
    public isViewportMinWidth_992px: boolean;
    public isNavMenuCollapsed = true;

    constructor( private auth: AuthService, private modal: MdbModalService ) {
        // Initialize these variables since we need them immediately.
        this._screenWidth = window.innerWidth;
        this.isViewportMinWidth_576px = this._screenWidth >= MediaScreenSize.Width_576px;
        this.isViewportMinWidth_992px = this._screenWidth >= MediaScreenSize.Width_992px;
    }

    // HTML elements with dynamic css.
    private _headerElement!: HTMLElement;
    private _navBrandImageElement!: HTMLElement;
    private _navElement!: HTMLElement;
    private _footerElement!: HTMLElement;
    private _headerSpacerElement!: HTMLElement;

    ngOnInit(): void {
        // HTML elements with dynamic css.
        this._headerElement = (document.getElementsByClassName( "header" )[0] as HTMLElement);
        this._navBrandImageElement = (document.getElementsByClassName( "nav__brand" )[0].children[0] as HTMLElement);
        this._navElement = (document.getElementsByClassName( "nav--container" )[0] as HTMLElement);
        this._footerElement = (document.getElementsByClassName( "footer" )[0] as HTMLElement);
        this._headerSpacerElement = (document.getElementById( "header-spacer" ) as HTMLElement);

        // Subscribe to sessionUser (is logged in).
        this._sessionUserSubscription = UserService.getSessionUser$().subscribe(
            {
                next: user => {
                    this.isLoggedIn = user !== undefined;
                    if ( this.isLoggedIn ) this.isAdmin = UserService.isSessionUserAdmin();
                    this.updateNavItems();
                },
                error: error => {
                    LoggerService.error(
                        JSON.stringify( error ),
                        LoggerService.setCaller( "HeaderComponent", this.ngOnInit )
                    );
                }
            }
        );

        this.resizeHeaderOnScroll();
        this.updateContentPosition();
    }

    updateNavItems() {
        const navItems = [
            { link: '/home', routerLink: 'home', title: 'Home', isVisible: true },
            { link: '/about', routerLink: 'about', title: 'About', isVisible: true },
            { link: '/login', routerLink: 'login', title: 'Login', isVisible: !this.isLoggedIn },
            { link: '/projects', routerLink: 'projects', title: 'Projects', isVisible: this.isLoggedIn },
            { link: '/teams', routerLink: 'teams', title: 'Teams', isVisible: this.isLoggedIn },
            { link: '/register', routerLink: 'register', title: 'register', isVisible: this.isAdmin },
            { link: '/dashboard', routerLink: 'dashboard', title: 'Dashboard', isVisible: this.isAdmin },
            { link: '/profile', routerLink: 'profile', title: 'Profile', isVisible: this.isLoggedIn },
        ];

        this.navItems = navItems.filter( n => n.isVisible );
    }

    @HostListener( 'window:resize', [ '$event' ] )
    onResizeHandler( event: { target: { innerWidth: any; innerHeight: any; }; } ) {
        this._screenWidth = event.target.innerWidth;
        this.isViewportMinWidth_576px = this._screenWidth >= MediaScreenSize.Width_576px;
        this.isViewportMinWidth_992px = this._screenWidth >= MediaScreenSize.Width_992px;

        // Update the header's size if there's a change on the viewport width.
        this.resizeHeaderOnScroll();

        // Update content position in relation to header height and/or it being fixed.
        this.updateContentPosition();
    }

    // When the user scrolls down 50px from the top of the document or gets closer to the footer, resize the header.
    @HostListener( 'window:scroll', [ '$event' ] )
    resizeHeaderOnScroll() {
        const footerPosition = this._footerElement.offsetTop - 75;

        if ( !this.isViewportMinWidth_992px ) {
            this._headerElement.style.position = "relative";
        }
        else {
            this._headerElement.style.position = "fixed";
        }

        if ( this.isViewportMinWidth_992px &&
             (document.body.scrollTop > footerPosition || document.documentElement.scrollTop > footerPosition) ) {
            this._headerElement.style.display = "none";
        }
        else if ( this.isViewportMinWidth_992px &&
                  (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) ) {
            this._headerElement.style.height = "10px";
            this._navElement.style.height = "10px";
            this._navBrandImageElement.style.width = "55px";
            this._navBrandImageElement.style.height = "50px";
            this._headerElement.style.display = "";
        }
        else {
            this._headerElement.style.height = "auto";
            this._navElement.style.height = "auto";
            this._navBrandImageElement.style.width = "80px";
            this._navBrandImageElement.style.height = "75px";
            this._headerElement.style.display = "";
        }
    }

    updateContentPosition() {
        if ( this.isViewportMinWidth_992px ) {
            this._headerSpacerElement.style.marginTop = "140px";
        }
        else {
            this._headerSpacerElement.style.marginTop = "0";
        }
    }

    openModal() {
        this.modalRef = this.modal.open(
            ModalComponent,
            { data: { title: 'Logout', content: 'Do you want to logout?' } }
        );
        this.modalRef.onClose.subscribe( ( message: any ) => {
            if ( message && message.isRightButtonSelected ) this.logout();
        } );
    }

    logout() {
        this.auth.logout();
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.updateNavItems();
    }

    ngOnDestroy() {
        this._sessionUserSubscription.unsubscribe();
    }
}
