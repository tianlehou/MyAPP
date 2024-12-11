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
import { CustomButtonComponent } from '../../../../shared/components/buttons/custom-button/custom-button.component';
import { SidebarComponent } from '../../../../shared/components/buttons/sidebar/sidebar.component';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    CustomButtonComponent,
    SidebarComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  selectedFile: File | null = null;
  userId: string | null = null;
  userEmail: string | null = null;
  profilePictureUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    
    private auth: Auth,
    private storage: Storage,
    private databaseService: DatabaseService,
  ) {}

  /** Inicializa el formulario */
  ngOnInit(): void {
    this.initializeForm();
    this.loadAuthenticatedUser();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      cedula: [''],
      direction: [''],
      profilePicture: [''],
      experience: this.fb.array([]),
      phone: ['', Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  /** Carga el usuario autenticado y sus datos */
  private loadAuthenticatedUser(): void {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.userId = user.uid;
        this.userEmail = user.email;
        console.log('Usuario autenticado:', this.userEmail);
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

      this.profileForm.patchValue({
        phone: userData?.phone || '',
        cedula: userData?.cedula || '',
        fullName: userData?.fullName || '',
        direction: userData?.direction || '',
        profilePicture: userData?.profilePicture || '',
      });

      if (userData?.profilePicture) {
        this.loadProfilePicture(userData.profilePicture);
      }

      // Carga los datos de experiencia
      const experiences = userData?.experience || [];
      const experienceArray = this.profileForm.get('experience') as FormArray;
      experiences.forEach((exp: any) => {
        const experienceGroup = this.fb.group({
          year: [exp.year || '', Validators.required],
          role: [exp.role || '', Validators.required],
          description: [exp.description || '', Validators.required],
        });
        experienceArray.push(experienceGroup);
      });
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  /** Carga la imagen de perfil desde Firebase Storage */
  private async loadProfilePicture(filePath: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, filePath);
      this.profilePictureUrl = await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error al cargar la imagen de perfil:', error);
    }
  }
}
