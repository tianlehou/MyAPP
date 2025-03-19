import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Database, ref, get } from '@angular/fire/database';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit {
  currentUser: User | null = null;
  userRole: string | null = null;

  constructor(private auth: Auth, private db: Database) {}

  ngOnInit(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.currentUser = user;
        console.log('Usuario autenticado:', user.email);

        // Obtener el rol del usuario desde la base de datos
        const userEmailKey = user.email ? user.email.replace(/\./g, '_') : '';
        const userRef = ref(this.db, `cv-app/users/${userEmailKey}`);

        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            this.userRole = userData.role; // Obtener el rol
            console.log('Rol del usuario:', this.userRole);
          } else {
            console.log('No se encontraron datos del usuario.');
          }
        } catch (error) {
          console.error('Error al obtener el rol:', error);
        }
      }
    });
  }
}
