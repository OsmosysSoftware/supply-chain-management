/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from 'ethers';
import { EthereumService } from './ethereum.service';
import { ContractService } from './contract.service';

// INTERNAL IMPORT
import tracking from '../assets/Tracking.json';

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
  private currentUserSubject = new BehaviorSubject<string | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  readonly DappName = 'Product Tracking Dapp';

  ContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  ContractABI = tracking.abi;

  constructor(
    private ethereumService: EthereumService,
    private contractService: ContractService,
  ) {
    this.ethereumService.signer.subscribe((signer) => {
      if (signer) {
        this.connectWallet();
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async connectWallet() {
    try {
      await this.ethereumService.connectToMetaMaskWallet();
      const address = await this.ethereumService.getSigner()?.getAddress();
      this.currentUserSubject.next(address || null);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  }

  async createShipment(items: any) {
    if (!this.contractService.contract) {
      console.error('Contract not initialized!');
      return;
    }

    try {
      const { receiver, pickupTime, distance, price } = items;
      const tx = await this.contractService.contract['createShipment'](
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
      if (!this.contractService.contract) {
        console.error('Contract not initialized!');
        return [];
      }

      const shipments = await this.contractService.contract['getAllTransactionsForSender']();
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
    try {
      if (!this.ethereumService.getSigner()) return 0;

      const address = await this.ethereumService.getSigner()?.getAddress();

      if (!address || !this.contractService.contract) return 0;

      const count = await this.contractService.contract['getShipmentsCount'](address);
      return count.toNumber();
    } catch (error) {
      console.error('error getting shipments count', error);
      return 0;
    }
  }

  async completeShipment(receiver: string, index: number) {
    try {
      if (!this.ethereumService.getSigner()) throw new Error('Not connected to MetaMask');

      if (!this.contractService.contract) throw new Error('Contract not initialized');

      const tx = await this.contractService.contract['completeShipment'](
        await this.ethereumService.getSigner()?.getAddress(),
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
    try {
      if (!this.ethereumService.getSigner()) throw new Error('Not connected to MetaMask');

      if (!this.contractService.contract) throw new Error('Contract not initialized');

      const address = await this.ethereumService.getSigner()?.getAddress();

      if (!address) return;

      const shipment = await this.contractService.contract['getShipment'](address, index);
      // eslint-disable-next-line consistent-return
      return {
        sender: shipment[0],
        receiver: shipment[1],
        pickupTime: shipment[2].toNumber(),
        deliveryTime: shipment[3].toNumber(),
        distance: shipment[4].toNumber(),
        price: ethers.formatEther(shipment[5].toString()),
        status: shipment[6],
        isPaid: shipment[7],
      };
    } catch (error) {
      console.error('error getting shipment', error);
      return undefined; // Return undefined on error
    }
  }

  async startShipment(receiver: string, index: number) {
    try {
      if (!this.ethereumService.getSigner()) throw new Error('Not connected to MetaMask');

      if (!this.contractService.contract) throw new Error('Contract not initialized');

      const tx = await this.contractService.contract['startShipment'](
        await this.ethereumService.getSigner()?.getAddress(),
        receiver,
        index,
        { gasLimit: 300000 },
      );
      await tx.wait();
      console.log('Shipment started:', tx);
    } catch (error) {
      console.error('error starting shipment', error);
    }
  }
}
