import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";

import { BlogEntryPreview } from "../models/blog-entry-preview.model";

@Component( {
                selector: 'app-home',
                templateUrl: './home.component.html',
                styleUrls: [ './home.component.css' ]
            } )
export class HomeComponent implements OnInit {

    uriPrefix = "/blog/"
    blogEntries = [
        new BlogEntryPreview(
            "blog-1",
            "First blog",
            "/assets/images/image-fallback.webp",
            "Image fallback.",
            "2022 March 20",
            "This is the first blog. The first blog has many things. Click on the first blog now."
        ),
        new BlogEntryPreview(
            "blog-2",
            "Second blog",
            "/assets/images/image-fallback.webp",
            "Image fallback.",
            "2022 March 19",
            "This is the second blog. Not as cool as the first blog, but still pretty good."
        ),
    ]

    constructor( private titleService: Title ) {
        this.titleService.setTitle( "Gira - Home" );
    }

    ngOnInit(): void {
    }

}
