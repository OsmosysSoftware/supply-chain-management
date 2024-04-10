/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShipmentData, TrackingService } from '../tracking.service';

@Component({
  selector: 'app-shipment',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './shipment.component.html',
  styleUrl: './shipment.component.css',
})
export class ShipmentComponent implements OnInit {
  constructor(
    private modalService: NgbModal,
    private trackingService: TrackingService,
  ) {}

  @ViewChild('content') content?: TemplateRef<any>; // Reference to the 'name' modal

  @ViewChild('contentId') contentId?: TemplateRef<any>; // Reference to the 'id' modal

  @ViewChild('contentReceiverAddress') contentReceiverAddress!: TemplateRef<any>;

  @ViewChild('profileModal') profileModal!: TemplateRef<any>;

  closeResult = '';

  receiverAddress = '';

  shipmentId = '';

  userBalance!: string;

  shipmentCount!: number;

  shipmentData: ShipmentData | undefined;

  submitShipment(modal: any) {
    const index = Number(this.shipmentId); // Assuming ID is numerical
    const receiverAddress = this.receiverAddress;
    console.log('inside submit shipment');

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(index)) {
      console.error('Invalid ID format');
      return;
    }

    if (!receiverAddress) {
      console.error('Missing receiver address');
      return;
    }

    this.trackingService
      .startShipment(this.receiverAddress, index)
      .then(() => {
        console.log('Shipment started successfully!');
        modal.close('Save click'); // Close modal on success
      })
      .catch((error) => {
        console.error('Error starting shipment:', error);
      });
  }

  completeShipment(modal: any) {
    const index = Number(this.shipmentId); // Assuming ID is numerical
    const receiverAddress = this.receiverAddress;

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(index)) {
      console.error('Invalid ID format');
      return;
    }

    if (!receiverAddress) {
      console.error('Missing receiver address');
      return;
    }

    this.trackingService
      .completeShipment(receiverAddress, index)
      .then(() => {
        console.log('Shipment completed successfully!');
        modal.close('Save click'); // Close modal on success
      })
      .catch((error) => {
        console.error('Error completing shipment:', error);
      });
  }

  getShipment() {
    const index = Number(this.shipmentId); // Assuming ID is numerical

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(index)) {
      console.error('Invalid ID format');
      return;
    }

    this.trackingService
      .getShipment(index)
      .then((shipment) => {
        if (shipment) {
          console.log('Shipment data received in component:', shipment);
          this.shipmentData = shipment;
        } else {
          console.error('Shipment not found');
        }
      })
      .catch((error) => {
        console.error('Error getting shipment:', error);
      });
  }

  async getUserData() {
    this.userBalance = await this.trackingService.getUserBalance();
    this.shipmentCount = await this.trackingService.getShipmentsCount();
  }

  clearData() {
    this.receiverAddress = '';

    this.shipmentId = '';

    this.shipmentData = undefined;
  }

  async OpenUserProfile() {
    this.userBalance = await this.trackingService.getUserBalance();
    this.shipmentCount = await this.trackingService.getShipmentsCount();
    this.modalService.open(this.profileModal);
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method, class-methods-use-this
  ngOnInit() {
    this.getUserData();
  }

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
        this.OpenUserProfile();
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

    if (modalRef) {
      modalRef.hidden.subscribe(() => {
        this.clearData();
      });
    }
  }
}
