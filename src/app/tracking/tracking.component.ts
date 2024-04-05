import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShipmentData, TrackingService } from '../tracking.service';
import { ShipmentStatusPipe } from '../shipment-status.pipe';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [FormsModule, CommonModule, ShipmentStatusPipe],
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css'],
})
export class TrackingComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shipments: ShipmentData[] = []; // Temporary - adjust based on your service

  showForm = false;

  newShipmentData!: ShipmentData;

  @ViewChild('trackingModal') trackingModal!: ElementRef;

  constructor(private trackingService: TrackingService) {}

  ngOnInit() {
    this.trackingService.getAllShipment().then((shipments: ShipmentData[]) => {
      this.shipments = shipments;
    });
    this.newShipmentData = {
      sender: '',
      receiver: '',
      price: '0',
      pickupTime: Date.now(),
      deliveryTime: 0,
      distance: 0,
      isPaid: false,
      status: 0,
    };
  }

  toggleForm() {
    this.showForm = !this.showForm;
    console.log(this.trackingModal, this.showForm);
  }

  async onSubmit() {
    try {
      // Call your service to create the shipment
      await this.trackingService.createShipment(this.newShipmentData);

      // Handle success (e.g., close the form, display a success message)
      this.showForm = false;
      console.log('Shipment created successfully');

      // Reset the form
      this.newShipmentData = {
        sender: '',
        receiver: '',
        price: '0',
        pickupTime: Date.now(),
        deliveryTime: 0,
        distance: 0,
        isPaid: false,
        status: 0,
      };
    } catch (error) {
      // Handle errors from the TrackingService
      console.error('Error creating shipment:', error);
    }
  }
}
