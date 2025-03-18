import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../../../../services/firebase.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-academic-formation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './academic-formation.component.html',
  styleUrls: ['./academic-formation.component.css'],
})
export class AcademicFormationComponent implements OnInit {
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
      academicFormation: this.fb.array([]),
    });
  }

  private async loadUserData(): Promise<void> {
    if (!this.userEmail) {
      console.error('Error: Usuario no autenticado.');
      return;
    }

    try {
      const userData = await this.firebaseService.getUserData(this.userEmail);

      // Carga los datos de formación académica
      const academicFormation = userData?.profileData?.academicFormation || [];
      const academicFormationArray = this.profileForm.get('academicFormation') as FormArray;

      academicFormation.forEach((formation: any) => {
        const formationGroup = this.fb.group({
          year: [formation.year || '', Validators.required],
          institution: [formation.institution || '', Validators.required],
          degree: [formation.degree || '', Validators.required],
        });
        academicFormationArray.push(formationGroup);
      });
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  get academicFormationArray(): FormArray {
    return this.profileForm.get('academicFormation') as FormArray;
  }
}