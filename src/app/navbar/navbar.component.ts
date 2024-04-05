import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EthereumService } from '../ethereum.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  walletAddress: string | null = null;

  constructor(private ethereumService: EthereumService) {}

  ngOnInit(): void {
    this.ethereumService.currentUser$.subscribe((address) => {
      this.walletAddress = address;
    });
  }

  async connectWallet() {
    await this.ethereumService.connectToMetaMaskWallet();
  }
}
