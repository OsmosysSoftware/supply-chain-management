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
  shipments: ShipmentData[] = [];

  shipmentForm!: FormGroup;

  private modalService = inject(NgbModal);

  closeResult = '';

  constructor(
    private trackingService: TrackingService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.getShipmentRecord();
    // Initialize the shipmentForm with appropriate validators
    this.shipmentForm = this.formBuilder.group({
      receiver: ['', Validators.required],
      pickupTime: ['', Validators.required], // Add a validator for this too
      distance: ['', [Validators.required, Validators.min(0)]],
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  getShipmentRecord() {
    this.trackingService.getAllShipment().then((shipments: ShipmentData[]) => {
      this.shipments = shipments;
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
    if (this.shipmentForm.valid) {
      this.trackingService
        .createShipment(this.shipmentForm.value)
        .then(() => {
          this.ngOnInit();
          this.modalService.dismissAll();
        })
        .catch((error) => console.error(error));
    }
  }
}
