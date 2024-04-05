/* eslint-disable no-console */
/* eslint-disable dot-notation */
/* eslint-disable import/no-extraneous-dependencies */
import { ethers } from 'ethers';
import { Injectable } from '@angular/core';
import { EthereumService } from './ethereum.service';
import tracking from '../assets/Tracking.json';
import { ContractService } from './contract.service';

export interface ShipmentData {
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

  ContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  ContractABI = tracking.abi;

  constructor(
    private ethereumService: EthereumService,
    private contractService: ContractService,
  ) {}

  fetchContract(): ethers.Contract | void {
    return this.contractService.getContract(this.ContractAddress, this.ContractABI);
  }

  async createShipment(items: ShipmentData) {
    try {
      const { receiver, pickupTime, distance, price } = items;
      const contract = this.fetchContract();

      if (!contract) {
        console.error('Error fetching contract');
        return;
      }

      const tx = await contract['createShipment'](
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
      const contract = this.fetchContract();

      if (!contract) {
        console.error('Error fetching contract');
        return [];
      }

      const shipments = await contract['getAllTransactionsForSender']();
      // eslint-disable-next-line consistent-return
      return shipments.map(
        (shipment: {
          sender: string;
          receiver: string;
          price: { toString: () => ethers.BigNumberish };
          pickupTime: { toNumber: () => number };
          deliveryTime: { toNumber: () => number };
          distance: { toNumber: () => number };
          isPaid: boolean;
          status: number;
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
    try {
      const signer = this.ethereumService.getSigner();
      const contract = this.fetchContract();

      if (!contract) {
        console.error('Error fetching contract');
        return 0;
      }

      if (!signer) return 0;

      const address = await signer.getAddress();
      const count = await contract['getShipmentsCount'](address);
      return count.toNumber();
    } catch (error) {
      console.error('error getting shipments count', error);
      return 0;
    }
  }

  async completeShipment(receiver: string, index: number) {
    try {
      const signer = this.ethereumService.getSigner();
      const contract = this.fetchContract();

      if (!contract) {
        console.error('Error fetching contract');
        return;
      }

      if (!signer) throw new Error('Not connected to MetaMask');

      const tx = await contract['completeShipment'](await signer.getAddress(), receiver, index, {
        gasLimit: 300000,
      });
      await tx.wait();
      console.log('Shipment completed:', tx);
    } catch (error) {
      console.error('error completing shipment', error);
    }
  }

  async getShipment(index: number): Promise<ShipmentData | undefined> {
    try {
      const signer = this.ethereumService.getSigner();
      const contract = this.fetchContract();

      if (!contract) {
        console.error('Error fetching contract');
        return undefined;
      }

      if (!signer) throw new Error('Not connected to MetaMask');

      const address = await signer.getAddress();
      const shipment = await contract['getShipment'](address, index);
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
    try {
      const signer = this.ethereumService.getSigner();
      const contract = this.fetchContract();

      if (!contract) {
        console.error('Error fetching contract');
        return;
      }

      if (!signer) throw new Error('Not connected to MetaMask');

      const tx = await contract['startShipment'](await signer.getAddress(), receiver, index, {
        gasLimit: 300000,
      });
      await tx.wait();
      console.log('Shipment started:', tx);
    } catch (error) {
      console.error('error starting shipment', error);
    }
  }
}
