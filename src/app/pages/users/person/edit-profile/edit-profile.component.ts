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

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, CustomButtonComponent],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit {
  // Formulario reactivo para editar el perfil
  profileForm!: FormGroup;

  // Archivo seleccionado para subir (imagen de perfil)
  selectedFile: File | null = null;

  // ID del usuario autenticado
  userId: string | null = null;

  // Campos que pueden ser editables, gestionados dinámicamente
  editableFields: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder, // Constructor para manejar formularios reactivos
    private auth: Auth, // Servicio de autenticación de Firebase
    private databaseService: DatabaseService // Servicio para interactuar con la base de datos
  ) {}

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.initializeForm(); // Configura el formulario inicial
    this.setEditableFields(); // Define los campos editables
    this.loadAuthenticatedUser(); // Carga los datos del usuario autenticado
  }

  // Configura el formulario con validaciones iniciales
  private initializeForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.required]],
      phone: ['', Validators.pattern('^\\+?[1-9]\\d{1,14}$')], // Validación para números de teléfono internacionales
      direction: [''],
      experience: this.fb.array([]), // FormArray para experiencia laboral
      profilePicture: [''], // Campo para la imagen de perfil
    });
  }

  // Define los campos que inicialmente no son editables
  private setEditableFields(): void {
    this.editableFields = {
      fullName: false,
      cedula: false,
      phone: false,
      direction: false,
      experience: false,
    };
  }

  // Carga el usuario autenticado y obtiene su ID
  private loadAuthenticatedUser(): void {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.userId = user.uid; // Guarda el ID del usuario
        await this.loadUserData(); // Carga los datos del usuario
      } else {
        console.error('No se pudo obtener el usuario autenticado.');
      }
    });
  }

  // Obtiene los datos del usuario desde la base de datos
  private async loadUserData(): Promise<void> {
    if (!this.userId) {
      console.error('Error: Usuario no autenticado.');
      return;
    }

    try {
      const userData = await this.databaseService.getUserData(this.userId);

      // Actualiza los valores del formulario con los datos del usuario
      this.profileForm.patchValue({
        fullName: userData?.fullName || '',
        cedula: userData?.cedula || '',
        phone: userData?.phone || '',
        direction: userData?.direction || '',
      });

      // Agrega experiencias al formulario
      this.populateExperiences(userData?.experience || []);
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  // Llena el FormArray de experiencias con datos únicos
  private populateExperiences(experiences: any[]): void {
    const formArray = this.experienceArray;

    // Limpia el FormArray antes de agregar nuevas experiencias
    formArray.clear();

    // Agrega cada experiencia si no existe ya en el FormArray
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

  // Verifica si una experiencia ya existe en el FormArray
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

  // Alterna el estado de edición de un campo
  toggleEdit(field: string): void {
    this.editableFields[field] = !this.editableFields[field];
    if (!this.editableFields[field]) {
      this.onSubmit(); // Guarda los cambios automáticamente al finalizar la edición
    }
  }

  // Maneja la selección de un archivo (imagen de perfil)
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profileForm.patchValue({ profilePicture: reader.result }); // Carga la imagen en base64
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Envía el formulario y guarda los datos en la base de datos
  async onSubmit(): Promise<void> {
    if (!this.profileForm.valid || !this.userId) {
      alert('Error en los datos o usuario no autenticado.');
      return;
    }

    try {
      const formData = {
        ...this.profileForm.value,
      };

      await this.databaseService.updateUserData(this.userId, formData);
      alert('Datos actualizados exitosamente.');
      await this.loadUserData(); // Recarga los datos del usuario
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al guardar datos. Intenta nuevamente.');
    }
  }

  // Getter para acceder al FormArray de experiencias
  get experienceArray(): FormArray {
    return this.profileForm.get('experience') as FormArray;
  }

  // Agrega una nueva experiencia al FormArray
  addExperience(): void {
    const experienceGroup = this.fb.group({
      year: ['', Validators.required],
      role: ['', Validators.required],
      description: ['', Validators.required],
    });
    this.experienceArray.push(experienceGroup);
  }

  // Elimina una experiencia del FormArray
  removeExperience(index: number): void {
    this.experienceArray.removeAt(index);
  }
}
