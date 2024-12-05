import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-auth-check',
  standalone: true,  // Define el componente como standalone
  imports: [CommonModule],  // Importamos CommonModule para *ngIf
  template: `
    <div *ngIf="isAuthenticated; else notAuthenticated">
      <p>Usuario autenticado: {{ userEmail }}</p>
    </div>
    <ng-template #notAuthenticated>
      <p>No hay ningún usuario autenticado.</p>
    </ng-template>
  `,
})
export class AuthCheckComponent implements OnInit {
  isAuthenticated: boolean = false;
  userEmail: string | null = null;

  constructor(private auth: Auth) {}

  ngOnInit(): void {
    console.log('AuthCheckComponent: ngOnInit');
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.isAuthenticated = true;
        this.userEmail = user.email;
        console.log('Usuario autenticado:', user.email);
      } else {
        this.isAuthenticated = false;
        this.userEmail = null;
        console.log('No hay usuario autenticado.');
      }
    });
  }
}
