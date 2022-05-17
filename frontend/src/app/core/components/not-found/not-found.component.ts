import { Component, OnInit } from '@angular/core';
import jsonContents from "./data/404-phrases.json";

import { faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import { Title } from "@angular/platform-browser";


@Component( {
                selector: 'app-not-found',
                templateUrl: './not-found.component.html',
                styleUrls: [ './not-found.component.css' ]
            } )
export class NotFoundComponent implements OnInit {

    language!: string;
    phrase!: string;
    faArrowRotateRight = faArrowRotateRight;

    constructor( private titleService: Title ) { }

    ngOnInit(): void {
        this.titleService.setTitle( "Gira - Not Found" );
        this.chooseRandomPhrase();
    }

    chooseRandomPhrase() {
        const randomPhraseEntry = jsonContents[Math.floor( Math.random() * jsonContents.length )];
        Object.entries( randomPhraseEntry )
              .forEach( ( [ key, value ] ) => {
                this.language = key;
                this.phrase = value;
              } );
    }
}
