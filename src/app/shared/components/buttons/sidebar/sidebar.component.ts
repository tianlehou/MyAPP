// sidebar.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule], // Agrega CommonModule aquí
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  isMenuOpen = false;

  constructor(private authService: AuthService) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  preventClose(event: Event) {
    event.stopPropagation();
  }

  logout() {
    this.authService.logout(); // Llama al método de logout del servicio
  }
}
