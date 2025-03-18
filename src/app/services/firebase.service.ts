import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { Database, ref, set, get, update } from '@angular/fire/database';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
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
      this.authState.next(!!user);
    });
  }

  private formatEmailKey(email: string): string {
    return email.replace(/\./g, '_');
  }

  registerWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(async () => {
        const user = await this.getCurrentUser();
        return user;
      })
      .catch((error) => {
        throw error;
      });
  }

  sendPasswordResetEmail(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  saveUserData(email: string, data: { fullName: string; email: string }) {
    const userEmailKey = this.formatEmailKey(email);
    const userRef = ref(this.db, `cv-app/users/${userEmailKey}`);
    return set(userRef, data);
  }

  isAuthenticated(): Observable<boolean> {
    return this.authState.asObservable();
  }

  async getCurrentUser() {
    const user = this.auth.currentUser;
    if (user?.email) {
      const userEmailKey = this.formatEmailKey(user.email);
      const userRef = ref(this.db, `cv-app/users/${userEmailKey}`);
      const snapshot = await get(userRef);
      return snapshot.exists() ? snapshot.val() : null;
    }
    return null;
  }

  logout() {
    this.auth.signOut();
  }

  async getUserData(emailKey: string): Promise<any> {
    const userRef = ref(this.db, `cv-app/users/${emailKey}`);
    try {
      const snapshot = await get(userRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error al obtener datos:', error);
      throw error;
    }
  }

  async updateUserData(
    originalEmail: string,
    data: Partial<{
      fullName: string;
      email: string;
      enabled: boolean;
      role: string;
      profileData: {
        phone?: string;
        cedula?: string;
        direction?: string;
        profilePicture?: string;
        experience?: string;
        aboutMe?: string;
      };
    }>
  ): Promise<void> {
    const userEmailKey = this.formatEmailKey(originalEmail);
    const userRef = ref(this.db, `cv-app/users/${userEmailKey}`);
    try {
      await update(userRef, data);
      console.log('Datos actualizados exitosamente');
    } catch (error) {
      console.error('Error al actualizar:', error);
      throw error;
    }
  }
}