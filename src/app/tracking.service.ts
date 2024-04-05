/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable no-console */
import { Injectable } from '@angular/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from 'ethers';
import { EthereumService } from './ethereum.service';

interface ShipmentData {
  sender: string;
  receiver: string;
  price: string;
  pickupTime: number;
  deliveryTime: number;
  distance: number;
  isPaid: boolean;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  readonly DappName = 'Product Tracking Dapp';

  private contract: ethers.Contract | undefined; // Private variable

  constructor(private ethereumService: EthereumService) {
    this.contract = this.ethereumService.getContract(); // Initialize on creation
  }

  async createShipment(items: any) {
    if (!this.contract) {
      console.error('Contract not initialized!');
      return;
    }

    try {
      const { receiver, pickupTime, distance, price } = items;
      const tx = await this.contract['createShipment'](
        receiver,
        new Date(pickupTime).getTime(),
        distance,
        ethers.parseUnits(price, 18),
        { value: ethers.parseUnits(price, 18) },
      );
      await tx.wait();
      console.log('Shipment created:', tx);
    } catch (error) {
      console.error('Error creating shipment:', error);
    }
  }

  async getAllShipment(): Promise<ShipmentData[]> {
    try {
      if (!this.contract) {
        console.error('Contract not initialized!');
        return [];
      }

      const shipments = await this.contract['getAllTransactionsForSender']();
      return shipments.map(
        (shipment: {
          sender: any;
          receiver: any;
          price: { toString: () => ethers.BigNumberish };
          pickupTime: { toNumber: () => any };
          deliveryTime: { toNumber: () => any };
          distance: { toNumber: () => any };
          isPaid: any;
          status: any;
        }) => ({
          sender: shipment.sender,
          receiver: shipment.receiver,
          price: ethers.formatEther(shipment.price.toString()),
          pickupTime: shipment.pickupTime.toNumber(),
          deliveryTime: shipment.deliveryTime.toNumber(),
          distance: shipment.distance.toNumber(),
          isPaid: shipment.isPaid,
          status: shipment.status,
        }),
      );
    } catch (error) {
      console.error('error getting shipments', error);
      return [];
    }
  }

  async getShipmentsCount(): Promise<number> {
    if (!this.contract) {
      console.error('Contract not initialized!');
      return 0;
    }

    try {
      const signer = this.ethereumService.getSigner();

      if (!signer) return 0;

      const address = await signer.getAddress();
      const count = await this.contract['getShipmentsCount'](address);
      return count.toNumber();
    } catch (error) {
      console.error('error getting shipments count', error);
      return 0;
    }
  }

  async completeShipment(receiver: string, index: number) {
    if (!this.contract) {
      console.error('Contract not initialized!');
      return;
    }

    try {
      const signer = this.ethereumService.getSigner();

      if (!signer) throw new Error('Not connected to MetaMask');

      const tx = await this.contract['completeShipment'](
        await signer.getAddress(),
        receiver,
        index,
        { gasLimit: 300000 },
      );
      await tx.wait();
      console.log('Shipment completed:', tx);
    } catch (error) {
      console.error('error completing shipment', error);
    }
  }

  async getShipment(index: number): Promise<ShipmentData | undefined> {
    if (!this.contract) {
      console.error('Contract not initialized!');
      return undefined;
    }

    try {
      const signer = this.ethereumService.getSigner();

      if (!signer) throw new Error('Not connected to MetaMask');

      const address = await signer.getAddress();
      const shipment = await this.contract['getShipment'](address, index);
      return {
        sender: shipment[0],
        receiver: shipment[1],
        pickupTime: shipment[2].toNumber(),
        deliveryTime: shipment[3].toNumber(),
        distance: shipment[4].toNumber(),
        price: ethers.formatEther(shipment[5].toString()), // Using ethers.utils
        status: shipment[6],
        isPaid: shipment[7],
      };
    } catch (error) {
      console.error('error getting shipment', error);
      return undefined;
    }
  }

  async startShipment(receiver: string, index: number) {
    if (!this.contract) {
      console.error('Contract not initialized!');
      return;
    }

    try {
      const signer = this.ethereumService.getSigner();

      if (!signer) throw new Error('Not connected to MetaMask');

      const tx = await this.contract['startShipment'](await signer.getAddress(), receiver, index, {
        gasLimit: 300000,
      });
      await tx.wait();
      console.log('Shipment started:', tx);
    } catch (error) {
      console.error('error starting shipment', error);
    }
  }
}
