/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, TemplateRef, inject, ViewChild } from '@angular/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-shipment',
  standalone: true,
  imports: [],
  templateUrl: './shipment.component.html',
  styleUrl: './shipment.component.css',
})
export class ShipmentComponent implements OnInit {
  private modalService = inject(NgbModal);

  @ViewChild('content') content?: TemplateRef<any>; // Reference to the 'name' modal

  @ViewChild('contentId') contentId?: TemplateRef<any>; // Reference to the 'id' modal

  @ViewChild('contentReceiverAddress') contentReceiverAddress!: TemplateRef<any>;

  @ViewChild('profileModal') profileModal!: TemplateRef<any>;

  closeResult = '';

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method, class-methods-use-this
  ngOnInit() {}

  open(modalType: string) {
    let modalRef;
    switch (modalType) {
      case 'name':
        modalRef = this.modalService.open(this.content); // Assuming 'content' is your name modal
        break;
      case 'id':
        modalRef = this.modalService.open(this.contentId);
        break;
      case 'receiverAddress':
        modalRef = this.modalService.open(this.contentReceiverAddress);
        break;
      case 'user':
        modalRef = this.modalService.open(this.profileModal);
        break;
      default:
        console.error('Unknown modal type');
    }

    if (modalRef) {
      // Ensure the modal opened successfully
      modalRef.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      });
    }
  }
}
