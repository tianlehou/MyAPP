import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { DatabaseService } from '../../../../services/database.service';
import { Button2Component } from '../../../../shared/components/buttons/button2/button2.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Button2Component],
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
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      cedula: [''],
      phone: ['', Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
      direction: [''],
      experience: this.fb.array([]), // FormArray para experiencia
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
        fullName: userData?.fullName || '',
        cedula: userData?.cedula || '',
        phone: userData?.phone || '',
        direction: userData?.direction || '',
      });

      // Carga los datos de experiencia
      const experiences = userData?.experience || [];
      experiences.forEach((exp: any) => {
        this.addExperience();
        const index = this.experienceArray.length - 1;
        this.experienceArray.at(index).patchValue(exp);
      });
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  // Getters
  get experienceArray(): FormArray {
    return this.profileForm.get('experience') as FormArray;
  }

  // Métodos para manipular la experiencia
  addExperience(): void {
    const experienceGroup = this.fb.group({
      year: ['', Validators.required],
      role: ['', Validators.required],
      description: ['', Validators.required],
    });
    this.experienceArray.push(experienceGroup);
  }

  removeExperience(index: number): void {
    this.experienceArray.removeAt(index);
  }

  /** Maneja la selección de archivos */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        console.log('Archivo seleccionado:', reader.result);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  /** Guarda los cambios en Firebase */
  async onSubmit(): Promise<void> {
    if (!this.profileForm.valid || !this.userId) {
      alert('Error en los datos o usuario no autenticado.');
      return;
    }

    try {
      const formData = {
        ...this.profileForm.value,
        fullName: this.profileForm.value.fullName,
        experience: this.profileForm.value.experience || [],
      };

      await this.databaseService.updateUserData(this.userId, formData);
      alert('Datos actualizados exitosamente.');
      await this.loadUserData(); // Recarga los datos después de actualizar
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al guardar datos. Intenta nuevamente.');
    }
  }
}
