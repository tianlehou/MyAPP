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
  selector: 'app-about-me',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.css'],
})
export class AboutMeComponent implements OnInit {
  profileForm!: FormGroup;
  userId: string | null = null;
  editableFields: { [key: string]: boolean } = {};
  isFormDirty = false; // Estado de cambios en el formulario
  showSaveButton = false; // Botón invisible al iniciar
  originalData: { [key: string]: any } = {}; // Datos originales antes de editar

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private databaseService: DatabaseService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setEditableFields();
    this.loadAuthenticatedUser();

    // Detectar cambios en el formulario
    this.profileForm.valueChanges.subscribe(() => {
      this.isFormDirty = this.profileForm.dirty;
    });
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      aboutMe: ['', Validators.required],
    });
  }

  private setEditableFields(): void {
    this.editableFields = {
      aboutMe: false,
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
      const aboutMe = userData?.profileData?.aboutMe || '';

      this.profileForm.patchValue({ aboutMe });
      this.originalData['aboutMe'] = aboutMe; // Guardar datos originales
      this.profileForm.markAsPristine(); // Reinicia el estado "dirty"
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  adjustTextareaHeightOnInit(field: string): void {
    if (field === 'aboutMe') {
      const textarea = document.querySelector(
        'textarea[formControlName="aboutMe"]'
      ) as HTMLTextAreaElement;
      if (textarea) {
        this.adjustTextareaHeight(textarea);
        textarea.addEventListener('input', () =>
          this.adjustTextareaHeight(textarea)
        );
      }
    }
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto'; // Restablece la altura
    textarea.style.height = `${textarea.scrollHeight}px`; // Ajusta al contenido
  }

  toggleEdit(field: string): void {
    this.editableFields[field] = !this.editableFields[field];

    if (this.editableFields[field]) {
      // Modo edición activado
      this.showSaveButton = true; // Mostrar el botón Guardar
      setTimeout(() => this.adjustTextareaHeightOnInit(field), 0);
    } else {
      // Cancelar edición, restaurar datos originales
      if (this.originalData[field] !== undefined) {
        this.profileForm.get(field)?.setValue(this.originalData[field]);
        this.profileForm.markAsPristine();
      }
      this.showSaveButton = false; // Ocultar el botón Guardar
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.profileForm.valid || !this.userId || !this.isFormDirty) {
      alert('Error en los datos o usuario no autenticado.');
      return;
    }
  
    try {
      // Obtener los datos actuales de profileData
      const userData = await this.databaseService.getUserData(this.userId);
      const currentProfileData = userData?.profileData || {};
  
      // Actualizar únicamente el campo aboutMe
      const updatedProfileData = {
        ...currentProfileData,
        aboutMe: this.profileForm.value.aboutMe,
      };
  
      // Guardar los datos actualizados en la base de datos
      await this.databaseService.updateUserData(this.userId, { profileData: updatedProfileData });
  
      alert('Datos actualizados exitosamente.');
  
      // Restaurar estado
      this.profileForm.markAsPristine();
      this.isFormDirty = false;
      this.editableFields['aboutMe'] = false;
      this.showSaveButton = false; // Ocultar el botón Guardar
      await this.loadUserData();
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al guardar datos. Intenta nuevamente.');
    }
  }
  
}
