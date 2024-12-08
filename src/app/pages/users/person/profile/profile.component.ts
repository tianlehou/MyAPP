import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { DatabaseService } from '../../../../services/database.service';
import { Button2Component } from '../../../../shared/components/buttons/button2/button2.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,
    Button2Component
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  selectedFile: File | null = null;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private databaseService: DatabaseService
  ) {}

  /** Inicializa el formulario */
  ngOnInit(): void {
    this.initializeForm();
    this.loadAuthenticatedUser();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
      experience: [''],
      profilePicture: [''],
    });
  }

  /** Carga el usuario autenticado y sus datos */
  private loadAuthenticatedUser(): void {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.userId = user.uid;
        console.log('Usuario autenticado:', this.userId);
        await this.loadUserData(); // Asegura la carga de datos tras obtener userId
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
      console.log('Datos del usuario cargados:', userData);
      this.profileForm.patchValue({
        name: userData?.fullName || '', // Mapear 'fullName' al campo 'name'
        email: userData?.email || '',
        phone: userData?.phone || '',
        experience: userData?.experience || '',
        profilePicture: userData?.profilePicture || '',
      });
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
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
      // Ajustar el nombre del campo a 'fullName'
      const formData = {
        ...this.profileForm.value,
        fullName: this.profileForm.value.name, // Copiar el valor de 'name' a 'fullName'
      };
      delete formData.name; // Eliminar el campo 'name' si no es necesario

      await this.databaseService.updateUserData(this.userId, formData);
      alert('Datos actualizados exitosamente.');
      await this.loadUserData(); // Recarga los datos después de guardar
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Ocurrió un error al actualizar los datos. Intenta nuevamente.');
    }
  }
}
