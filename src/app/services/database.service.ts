import { Injectable } from '@angular/core';
import { Database, ref, set, get, update } from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(private db: Database) {
    console.log('DatabaseService initialized with:', db);
  }

  // Guardar datos adicionales en Firebase Realtime Database
  saveUserData(uid: string, data: { fullName: string; email: string }) {
    const userRef = ref(this.db, `users/${uid}`);
    return set(userRef, data);
  }

  // Obtener datos de usuario desde Firebase Realtime Database
  getUserData(uid: string) {
    const userRef = ref(this.db, `users/${uid}`);
    return get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        throw new Error('No se encontraron datos para este usuario.');
      }
    });
  }

  // Actualizar datos de usuario en Firebase Realtime Database
  updateUserData(uid: string, data: Partial<{ fullName: string; email: string; phone: string; experience: string; profilePicture: string }>) {
    const userRef = ref(this.db, `users/${uid}`);
    return update(userRef, data);
  }
}
