import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { Auth } from '@angular/fire/auth';
import { DatabaseService } from '../../../../../../services/database.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-profile-picture',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.css'],
})
export class ProfilePictureComponent implements OnInit {
  profileForm!: FormGroup;
  userId: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private auth: Auth,
    private fb: FormBuilder,
    private storage: Storage,
    private databaseService: DatabaseService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAuthenticatedUser();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      profilePicture: [''],
    });
  }

  private loadAuthenticatedUser(): void {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.userId = user.uid;
        await this.loadUserData();
      } else {
        console.error('No se pudo obtener el usuario autenticado.');
      }
    });
  }

  private async loadUserData(): Promise<void> {
    if (!this.userId) {
      console.error('Error: Usuario no autenticado.');
      return;
    }

    try {
      const userData = await this.databaseService.getUserData(this.userId);
      const profilePicture = userData?.profileData?.profilePicture || '';
      this.profileForm.patchValue({ profilePicture });
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profileForm.patchValue({ profilePicture: reader.result });
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.selectedFile || !this.userId) {
      alert('Selecciona una imagen válida o inicia sesión.');
      return;
    }
  
    try {
      const storageRef = ref(this.storage, `profile-pictures/${this.userId}`);
      await uploadBytes(storageRef, this.selectedFile);
      const downloadURL = await getDownloadURL(storageRef);
  
      const userData = await this.databaseService.getUserData(this.userId);
      const currentProfileData = userData?.profileData || {};
  
      // Actualizar solo el campo profilePicture
      const updatedProfileData = { 
        ...currentProfileData, 
        profilePicture: downloadURL 
      };
  
      // Guardar los datos actualizados en la base de datos
      await this.databaseService.updateUserData(this.userId, { profileData: updatedProfileData });
  
      alert('Foto de perfil actualizada exitosamente.');
      await this.loadUserData();
    } catch (error) {
      console.error('Error al cargar la imagen a Firebase Storage:', error);
      alert('Error al guardar la foto. Intenta nuevamente.');
    }
  }
}
