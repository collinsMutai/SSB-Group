import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  isMenuOpen = false;

  // Method to toggle the menu
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Navigate to a specific section and close the mobile menu
  navigateToAndClose(section: string) {
    // Scroll to the section
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }

    // Close the mobile menu
    this.isMenuOpen = false;
  }

  // This method can be used to scroll to a specific section of the page
  navigateTo(section: string) {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
