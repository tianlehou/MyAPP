import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { DatabaseService } from '../../../../services/database.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  selectedFile: File | null = null;
  userId: string | null = null;
  editableFields: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private databaseService: DatabaseService
  ) {}

  /** Inicializa el formulario */
  ngOnInit(): void {
    this.initializeForm();
    this.setEditableFields();
    this.loadAuthenticatedUser();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
      experience: [''],
      profilePicture: [''], // Imagen en Base64 o URL
    });
  }

  /** Establece los campos como no editables por defecto */
  private setEditableFields(): void {
    this.editableFields = {
      name: false,
      email: false,
      phone: false,
      experience: false,
    };
  }

  /** Carga el usuario autenticado y sus datos */
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

  /** Carga los datos del usuario desde Firebase */
  private async loadUserData(): Promise<void> {
    if (!this.userId) {
      console.error('Error: Usuario no autenticado.');
      return;
    }

    try {
      const userData = await this.databaseService.getUserData(this.userId);
      this.profileForm.patchValue({
        name: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        experience: userData.experience || '',
        profilePicture: userData.profilePicture || '',
      });
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  /** Alterna el estado de edición de un campo */
  toggleEdit(field: string): void {
    this.editableFields[field] = !this.editableFields[field];
    if (!this.editableFields[field]) {
      this.onSubmit();
    }
  }
  

  /** Maneja la selección de archivos */
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

  /** Envía los datos del formulario */
  async onSubmit(): Promise<void> {
    if (!this.profileForm.valid) {
      alert('Por favor, completa correctamente todos los campos requeridos.');
      return;
    }
  
    if (!this.userId) {
      alert('Error: Usuario no autenticado.');
      return;
    }
  
    try {
      const formData = this.profileForm.value;
      await this.databaseService.updateUserData(this.userId, formData); // Llama al método para actualizar
      alert('Datos actualizados exitosamente.');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Ocurrió un error al actualizar los datos. Intenta nuevamente.');
    }
  }
  
}
