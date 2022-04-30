import { Component, OnInit } from '@angular/core';
import { LightboxService } from "@core/services/lightbox/lightbox.service";

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  constructor( private lightboxService: LightboxService ) { }

  ngOnInit(): void {
  }

}
