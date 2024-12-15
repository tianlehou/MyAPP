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
  saveUserData(
    uid: string,
    data: { fullName: string; email: string }
  ): Promise<void> {
    const userRef = ref(this.db, `users/${uid}`);
    return set(userRef, data)
      .then(() => console.log('Datos guardados exitosamente'))
      .catch((error) => {
        console.error('Error al guardar los datos:', error);
        throw error;
      });
  }

  // Obtener datos de usuario desde Firebase Realtime Database
  async getUserData(uid: string): Promise<any> {
    const userRef = ref(this.db, `users/${uid}`);
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.error('No se encontraron datos para el usuario:', uid);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      throw error;
    }
  }

  // Actualizar datos de usuario en Firebase Realtime Database
  async updateUserData(
    uid: string,
    data: Partial<{
      fullName: string;
      email: string;
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
    const userRef = ref(this.db, `users/${uid}`);
    try {
      await update(userRef, data);
      console.log('Datos actualizados exitosamente');
    } catch (error) {
      console.error('Error al actualizar los datos:', error);
      throw error;
    }
  }
}
