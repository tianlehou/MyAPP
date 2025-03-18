import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../../../../services/firebase.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css'],
})
export class ExperienceComponent implements OnInit {
  @Input() currentUser: User | null = null;
  profileForm!: FormGroup;
  userEmail: string | null = null;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.currentUser) {
      this.userEmail = this.currentUser.email?.replaceAll('.', '_') || null;
      this.loadUserData();
    }
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      experience: this.fb.array([]), // Arreglo para experiencia laboral
    });
  }

  private async loadUserData(): Promise<void> {
    if (!this.userEmail) {
      console.error('Error: Usuario no autenticado.');
      return;
    }

    try {
      const userData = await this.firebaseService.getUserData(this.userEmail);

      // Carga los datos de experiencia
      const experiences = userData?.profileData?.experience || [];
      const experienceArray = this.profileForm.get('experience') as FormArray;
      experiences.forEach((exp: any) => {
        const experienceGroup = this.fb.group({
          year: [exp.year || '', Validators.required],
          company: [exp.company || '', Validators.required],
          role: [exp.role || '', Validators.required],
          description: [exp.description || '', Validators.required],
        });
        experienceArray.push(experienceGroup);
      });
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }
}