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
import { CustomButtonComponent } from '../../../../shared/components/buttons/custom-button/custom-button.component';
import { DeleteConfirmModalComponent } from './delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    CommonModule,
    CustomButtonComponent,
    DeleteConfirmModalComponent,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  selectedFile: File | null = null;
  userId: string | null = null;
  editableFields: { [key: string]: boolean } = {};
  isDeleteModalVisible: boolean = false;
  experienceIndexToDelete: number | null = null;

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
      experience: this.fb.array([]),
      profilePicture: [''],
    });
  }

  private setEditableFields(): void {
    this.editableFields = {
      fullName: false,
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
        fullName: userData?.fullName || '',
        cedula: userData?.cedula || '',
        phone: userData?.phone || '',
        direction: userData?.direction || '',
      });
      this.populateExperiences(userData?.experience || []);
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  private populateExperiences(experiences: any[]): void {
    const formArray = this.experienceArray;
    formArray.clear();
    experiences.forEach((exp) => {
      if (!this.experienceExists(exp)) {
        const experienceGroup = this.fb.group({
          year: [exp.year || '', Validators.required],
          role: [exp.role || '', Validators.required],
          description: [exp.description || '', Validators.required],
        });
        formArray.push(experienceGroup);
      }
    });
  }

  private experienceExists(exp: any): boolean {
    return this.experienceArray.controls.some((control) => {
      const experience = control.value;
      return (
        experience.year === exp.year &&
        experience.role === exp.role &&
        experience.description === exp.description
      );
    });
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
      const formData = { ...this.profileForm.value };
      await this.databaseService.updateUserData(this.userId, formData);
      alert('Datos actualizados exitosamente.');
      await this.loadUserData();
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al guardar datos. Intenta nuevamente.');
    }
  }

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

  async removeExperience(index: number): Promise<void> {
    if (index < 0 || index >= this.experienceArray.length) {
      console.error('Índice inválido al intentar eliminar una experiencia.');
      return;
    }

    this.experienceArray.removeAt(index);

    if (this.userId) {
      try {
        const updatedData = {
          ...this.profileForm.value,
          experience: this.experienceArray.value,
        };
        await this.databaseService.updateUserData(this.userId, updatedData);
        console.log(
          'Experiencia eliminada y datos sincronizados con la base de datos.'
        );
      } catch (error) {
        console.error(
          'Error al sincronizar los datos con la base de datos:',
          error
        );
      }
    } else {
      console.error(
        'Usuario no autenticado. No se puede actualizar la base de datos.'
      );
    }
  }

  confirmDeleteExperience(index: number): void {
    this.experienceIndexToDelete = index;
    this.isDeleteModalVisible = true; // Activa la visibilidad del modal
  }

  onDeleteConfirmed(): void {
    if (this.experienceIndexToDelete !== null) {
      this.removeExperience(this.experienceIndexToDelete);
    }
    this.experienceIndexToDelete = null; // Resetea el índice
    this.isDeleteModalVisible = false; // Cierra el modal
  }

  onDeleteCanceled(): void {
    this.experienceIndexToDelete = null; // Resetea el índice
    this.isDeleteModalVisible = false; // Cierra el modal
  }
}
