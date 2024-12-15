import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { DatabaseService } from '../../../../../../services/database.service';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.css'],
})
export class PersonalDataComponent implements OnInit {
  profileForm!: FormGroup;
  userId: string | null = null;
  editableFields: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private databaseService: DatabaseService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setEditableFields();
    this.loadAuthenticatedUser();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.required]],
      phone: ['', Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
      direction: [''],
    });
  }

  private setEditableFields(): void {
    this.editableFields = {
      fullName: false,
      cedula: false,
      phone: false,
      direction: false,
    };
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
  
      this.profileForm.patchValue({
        fullName: userData?.fullName || '', // Cargar fullName directamente
        cedula: userData?.profileData?.cedula || '', // Cargar desde profileData
        phone: userData?.profileData?.telefono || '', // Cargar desde profileData
        direction: userData?.profileData?.direccion || '', // Cargar desde profileData
      });
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }
  

  toggleEdit(field: string): void {
    this.editableFields[field] = !this.editableFields[field];
    if (!this.editableFields[field]) {
      this.onSubmit();
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.profileForm.valid || !this.userId) {
      alert('Error en los datos o usuario no autenticado.');
      return;
    }
  
    try {
      // Obtener los datos actuales de profileData
      const userData = await this.databaseService.getUserData(this.userId);
      const currentProfileData = userData?.profileData || {};
  
      // Actualizar los campos necesarios en profileData
      const updatedProfileData = {
        ...currentProfileData,
        direccion: this.profileForm.value.direction,
        cedula: this.profileForm.value.cedula,
        telefono: this.profileForm.value.phone,
      };
  
      // Guardar los datos actualizados en la base de datos
      await this.databaseService.updateUserData(this.userId, {
        profileData: updatedProfileData,
        fullName: this.profileForm.value.fullName, // Guardar fullName por separado
      });
  
      alert('Datos actualizados exitosamente.');
  
      // Recargar datos del usuario
      await this.loadUserData();
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al guardar datos. Intenta nuevamente.');
    }
  }
  
}
