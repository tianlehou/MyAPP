// auth.service.ts
import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth, private router: Router) {}

  // Método para registrar con email y contraseña
  registerWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Método para iniciar sesión con email y contraseña
  loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(() => {
        // Redirige al usuario a la página "profile" tras el inicio de sesión exitoso
        this.router.navigate(['profile']);
      })
      .catch((error) => {
        throw error;
      });
  }

  // Método para iniciar sesión con Google
  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider)
      .then(() => this.router.navigate(['profile']))
      .catch((error) => {
        throw error;
      });
  }

  // Método para recuperar contraseña
  sendPasswordResetEmail(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  logout() {
    return this.auth.signOut().then(() => this.router.navigate(['/']));
  }
}
