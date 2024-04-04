/* eslint-disable no-console */
import { Injectable, NgZone } from '@angular/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import tracking from '../assets/Tracking.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let window: any;

@Injectable({
  providedIn: 'root',
})
export class EthereumService {
  private provider: ethers.BrowserProvider | undefined;

  public signer = new BehaviorSubject<ethers.JsonRpcSigner | undefined>(undefined);

  private currentUserSubject = new BehaviorSubject<string | null>(null);

  private contract: ethers.Contract | undefined;

  ContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  ContractABI = tracking.abi;

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private ngZone: NgZone) {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer.next(this.getSigner());

      if (this.signer.getValue()) {
        this.initializeContract();
      }

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
    this.currentUserSubject.next(accounts[0] || null);
  }

  async connectToMetaMaskWallet() {
    if (typeof window.ethereum !== 'undefined') {
      // Request access to the user's MetaMask account
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length === 0) throw new Error('No accounts found.');

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

  public updateCurrentUser(address: string | null) {
    this.currentUserSubject.next(address);
  }

  initializeContract() {
    const signer = this.getSigner();

    if (signer) {
      this.contract = new ethers.Contract(this.ContractAddress, this.ContractABI, signer);
    }
  }

  public getContract() {
    if (!this.contract) {
      this.initializeContract();
    }

    return this.contract;
  }
}
