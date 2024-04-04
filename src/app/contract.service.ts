import { Injectable } from '@angular/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from 'ethers';
import { EthereumService } from './ethereum.service';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  public contract: ethers.Contract | undefined;

  constructor(private ethereumService: EthereumService) {}

  getContract() {
    return this.ethereumService.getContract();
  }
}
