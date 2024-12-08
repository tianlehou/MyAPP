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
import { IonicModule } from '@ionic/angular';
import { Button2Component } from '../../../../shared/components/buttons/button2/button2.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, Button2Component],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  selectedFile: File | null = null;
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
      name: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.required]],
      phone: ['', Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
      direction: [''],
      experience: this.fb.array([]), // FormArray para experiencia
      profilePicture: [''],
    });
  }

  private setEditableFields(): void {
    this.editableFields = {
      name: false,
      cedula: false,
      phone: false,
      direction: false,
      experience: false,
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
        name: userData?.fullName || '',
        cedula: userData?.cedula || '',
        phone: userData?.phone || '',
        direction: userData?.direction || '',
      });

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

  toggleEdit(field: string): void {
    this.editableFields[field] = !this.editableFields[field];
    if (!this.editableFields[field]) {
      this.onSubmit();
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
    if (!this.profileForm.valid || !this.userId) {
      alert('Error en los datos o usuario no autenticado.');
      return;
    }

    try {
      const formData = {
        ...this.profileForm.value,
        fullName: this.profileForm.value.name,
        experience: this.profileForm.value.experience || [],
      };

      await this.databaseService.updateUserData(this.userId, formData);
      alert('Datos actualizados exitosamente.');
      await this.loadUserData();
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al guardar datos. Intenta nuevamente.');
    }
  }

  // Experiencia FormArray
  get experienceArray(): FormArray {
    return this.profileForm.get('experience') as FormArray;
  }

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
}
