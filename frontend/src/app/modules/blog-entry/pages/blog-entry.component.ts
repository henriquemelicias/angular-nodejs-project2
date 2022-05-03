import { Component, OnInit } from '@angular/core';
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

  constructor() {
  }

  ngOnInit(): void {
  }


}
