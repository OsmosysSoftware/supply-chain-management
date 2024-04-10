/* eslint-disable @typescript-eslint/no-explicit-any */
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
  pickupTime: any;
  deliveryTime: any;
  distance: any;
  isPaid: boolean;
  status: any;
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
      console.log(items);
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

  async getAllShipment(): Promise<any[]> {
    try {
      const contract = this.fetchContract();

      if (!contract) {
        console.error('Error fetching contract');
        return [];
      }

      const shipments: any[] = await contract['getAllTransactions']();
      console.log('Raw shipments data:', shipments); // Log the raw data

      // eslint-disable-next-line consistent-return
      return shipments.map((shipment) => ({
        // Remove unnecessary nested destructuring
        sender: shipment.sender,
        receiver: shipment.receiver,
        price: ethers.formatEther(shipment.price.toString()),
        pickupTime: new Date(Number(shipment.pickupTime)).toLocaleString(),
        deliveryTime: Number(shipment.deliveryTime),
        distance: shipment.distance,
        isPaid: shipment.isPaid,
        status: shipment.status,
      }));
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
      return count;
    } catch (error) {
      console.error('error getting shipments count', error);
      return 0;
    }
  }

  async getUserBalance(): Promise<string> {
    try {
      const signer = this.ethereumService.getSigner();

      if (!signer) throw new Error('Not connected to MetaMask');

      const contract = this.fetchContract();

      if (!contract) {
        console.error('Error fetching contract');
        return '';
      }

      const balanceWei = await this.ethereumService.getBalance(await signer.getAddress());
      console.log('balance', balanceWei);

      if (balanceWei) {
        return ethers.formatEther(balanceWei);
      }

      return '0';
    } catch (error) {
      console.error('error getting user balance', error);
      return '0';
    }
  }

  async completeShipment(receiver: string, index: number) {
    try {
      console.log('receiver:', receiver, 'index:', index);
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
      console.log('getting data from service', index, shipment);
      return {
        sender: shipment[0],
        receiver: shipment[1],
        pickupTime: shipment[2],
        deliveryTime: shipment[3],
        distance: shipment[4],
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
