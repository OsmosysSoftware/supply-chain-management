/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingService } from '../tracking.service';
import { ShipmentStatusPipe } from '../shipment-status.pipe';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, ShipmentStatusPipe],
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css'],
})
export class TrackingComponent implements OnInit {
  shipments: any[] = []; // Temporary - adjust based on your service

  constructor(private trackingService: TrackingService) {}

  ngOnInit() {
    this.trackingService.getAllShipment().then((shipments: any[]) => {
      this.shipments = shipments;
    });
  }
}
