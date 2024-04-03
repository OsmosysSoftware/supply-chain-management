/* eslint-disable no-console */
import { Injectable, NgZone } from '@angular/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from 'ethers';
import { BehaviorSubject } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let window: any;

@Injectable({
  providedIn: 'root',
})
export class EthereumService {
  private provider: ethers.BrowserProvider | undefined;

  private signer: BehaviorSubject<ethers.JsonRpcSigner | undefined> = new BehaviorSubject<
    ethers.JsonRpcSigner | undefined
  >(undefined);

  constructor(private ngZone: NgZone) {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer.next(this.getSigner());

      // Listen for changes in MetaMask accounts
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        this.ngZone.run(() => {
          if (accounts.length === 0) {
            // MetaMask disconnected or switched accounts
            this.handleMetaMaskDisconnect();
          } else {
            // MetaMask accounts changed
            this.handleMetaMaskAccountsChanged(accounts);
          }
        });
      });
    } else {
      console.error('MetaMask is not installed.');
    }
  }

  private handleMetaMaskDisconnect() {
    console.log('MetaMask disconnected.');
    this.provider = undefined;
    this.signer.next(undefined);
  }

  private handleMetaMaskAccountsChanged(accounts: string[]) {
    console.log('MetaMask accounts changed:', accounts);
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer.next(this.getSigner());
  }

  async connectToMetaMaskWallet() {
    if (typeof window.ethereum !== 'undefined') {
      // Request access to the user's MetaMask account
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Connect to MetaMask using the Web3Provider
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer.next(this.getSigner());

      const address = await this.signer.getValue()?.getAddress();

      console.log('Connected to MetaMask with address:', address);
    } else {
      console.error('MetaMask is not installed.');
    }
  }

  getSigner() {
    return this.signer.getValue();
  }
}
