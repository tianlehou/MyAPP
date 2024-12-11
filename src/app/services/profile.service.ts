import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { DatabaseService } from '../services/database.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private fb: FormBuilder, private auth: Auth, private databaseService: DatabaseService) {}

  initializeProfileForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.required]],
      phone: ['', Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
      direction: [''],
      experience: this.fb.array([]),
      profilePicture: [''],
    });
  }

  async loadAuthenticatedUser(callback: (userId: string) => Promise<void>): Promise<void> {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        await callback(user.uid);
      } else {
        console.error('No se pudo obtener el usuario autenticado.');
      }
    });
  }

  async loadUserData(userId: string, profileForm: FormGroup): Promise<void> {
    try {
      const userData = await this.databaseService.getUserData(userId);
      profileForm.patchValue({
        fullName: userData?.fullName || '',
        cedula: userData?.cedula || '',
        phone: userData?.phone || '',
        direction: userData?.direction || '',
      });
      this.populateExperiences(profileForm.get('experience') as FormArray, userData?.experience || []);
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  populateExperiences(formArray: FormArray, experiences: any[]): void {
    formArray.clear();
    experiences.forEach((exp) => {
      const experienceGroup = this.fb.group({
        year: [exp.year || '', Validators.required],
        role: [exp.role || '', Validators.required],
        description: [exp.description || '', Validators.required],
      });
      formArray.push(experienceGroup);
    });
  }
}
