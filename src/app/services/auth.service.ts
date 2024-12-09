// auth.service.ts
import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from '@angular/fire/auth';
import { Database, set, ref } from '@angular/fire/database';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authState = new BehaviorSubject<boolean>(false);
  constructor(
    private auth: Auth,
    private db: Database,
    private router: Router
  ) {
    this.monitorAuthState();
  }

  private monitorAuthState() {
    onAuthStateChanged(this.auth, (user) => {
      this.authState.next(!!user); // Si hay un usuario autenticado, establece el estado en true
    });
  }

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

  // Método para recuperar contraseña
  sendPasswordResetEmail(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  // Guardar datos adicionales en Firebase Realtime Database
  saveUserData(uid: string, data: { fullName: string; email: string }) {
    const userRef = ref(this.db, `users/${uid}`);
    return set(userRef, data);
  }

  isAuthenticated(): Observable<boolean> {
    return this.authState.asObservable(); // Devuelve el estado de autenticación como un observable
  }

  logout() {
    this.auth.signOut();
  }
}
