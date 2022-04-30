import { Component, Input, OnInit } from '@angular/core';

@Component( {
  selector: 'app-footer-subscription-form',
  templateUrl: './footer-subscription-form.component.html',
  styleUrls: [ './footer-subscription-form.component.css' ]
} )
export class FooterSubscriptionFormComponent implements OnInit {

  isSubmitted = false;
  emailToSubmit = "";

  constructor() { }

  ngOnInit(): void {}

  onSubmit() {
    this.isSubmitted = true;
  }
}
