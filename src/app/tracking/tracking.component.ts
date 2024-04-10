/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, TemplateRef, inject } from '@angular/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrackingService, ShipmentData } from '../tracking.service';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [NgbDatepickerModule, ReactiveFormsModule, CommonModule],
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css'],
})
export class TrackingComponent implements OnInit {
  shipments: ShipmentData[] = []; // Temporary - adjust based on your service

  shipmentForm!: FormGroup; // Declare your form group

  private modalService = inject(NgbModal);

  closeResult = '';

  constructor(
    private trackingService: TrackingService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.trackingService.getAllShipment().then((shipments: ShipmentData[]) => {
      this.shipments = shipments;
    });
    // Initialize the shipmentForm with appropriate validators
    this.shipmentForm = this.formBuilder.group({
      receiver: ['', Validators.required],
      pickupTime: ['', Validators.required], // Add a validator for this too
      distance: ['', [Validators.required, Validators.min(0)]],
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      });
  }

  // eslint-disable-next-line class-methods-use-this
  getStatusLabel(status: bigint): string {
    if (status === 0n) {
      return 'Pending';
    }

    if (status === 1n) {
      return 'IN_TRANSIT';
    }

    return 'Delivered';
  }

  onSubmit() {
    // Handle the form submission here
    console.log(this.shipmentForm.value); // This will give you the form data

    if (this.shipmentForm.valid) {
      // Check for basic form validity
      const newShipment = this.shipmentForm.value;

      // Use your service to send the data
      this.trackingService
        .createShipment(newShipment)
        .then(() => {
          // Update the list of shipments
          this.ngOnInit(); // Re-fetch data to refresh the view
          this.modalService.dismissAll(); // Close the modal
        })
        .catch((error) => console.error(error));
    }
  }
}
