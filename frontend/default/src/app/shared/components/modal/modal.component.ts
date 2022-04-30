import { Component, OnInit } from '@angular/core';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';

@Component( {
              selector: 'app-modal',
              templateUrl: './modal.component.html',
              styleUrls: [ './modal.component.css' ]
            } )
export class ModalComponent implements OnInit {

  isRightButtonSelected = false;

  title: string | null = null;
  content: string | null = null;
  leftButton: string = 'Cancel';
  rightButton: string = 'Confirm';

  constructor( public modalRef: MdbModalRef<ModalComponent> ) {}

  ngOnInit(): void {
  }

  close(): void {
    const closeMessage = { isRightButtonSelected: this.isRightButtonSelected }
    this.modalRef.close( closeMessage )
  }
}
