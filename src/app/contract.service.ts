/* eslint-disable no-console */
import { Injectable } from '@angular/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from 'ethers';
import { EthereumService } from './ethereum.service';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  public contract!: ethers.Contract;

  constructor(private ethereumService: EthereumService) {}

  getContract(
    address: string | ethers.Addressable,
    abi: ethers.Interface | ethers.InterfaceAbi,
  ): ethers.Contract | void {
    const signer = this.ethereumService.getSigner();

    if (!signer) {
      console.log('Need to be signed in to get contracts!');
      return;
    }

    this.contract = new ethers.Contract(address, abi, signer);

    // eslint-disable-next-line consistent-return
    return this.contract;
  }
}
