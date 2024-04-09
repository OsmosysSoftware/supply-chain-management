import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'shipmentStatus', standalone: true })
export class ShipmentStatusPipe implements PipeTransform {
  defaultStatus = 'Pending';

  transform(status: number): string {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'IN_TRANSIT';
      case 2:
        return 'Delivered';
      default:
        return this.defaultStatus; // Accessing class property
    }
  }
}
