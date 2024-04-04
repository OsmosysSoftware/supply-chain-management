import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  showMenu = false;

  navigation = [
    { title: 'Home', path: '/' }, // Adjust paths as needed
    { title: 'Services', path: '/services' },
    { title: 'Contact Us', path: '/contact' },
  ];

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
}
