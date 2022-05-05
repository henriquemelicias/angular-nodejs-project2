import { Component, OnInit } from '@angular/core';
import jsonContents from "./data/404-phrases.json";

@Component( {
                selector: 'app-not-found',
                templateUrl: './not-found.component.html',
                styleUrls: [ './not-found.component.css' ]
            } )
export class NotFoundComponent implements OnInit {

    language!: string;
    phrase!: string;

    constructor() { }

    ngOnInit(): void {
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
