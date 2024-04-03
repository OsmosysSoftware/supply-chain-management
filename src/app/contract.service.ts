import { Injectable } from '@angular/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from 'ethers';
import { EthereumService } from './ethereum.service';
// INTERNAL IMPORT
import tracking from '../assets/Tracking.json';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  public contract: ethers.Contract | undefined;

  ContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  ContractABI = tracking.abi;

  constructor(private ethereumService: EthereumService) {}

  getContract() {
    const signer = this.ethereumService.getSigner();

    if (!signer) {
      // eslint-disable-next-line no-console
      console.log('Need to be signed in to get contracts!');
      return;
    }

    this.contract = new ethers.Contract(this.ContractAddress, this.ContractABI, signer);
  }
}
