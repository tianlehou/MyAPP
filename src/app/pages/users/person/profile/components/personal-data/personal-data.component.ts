import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../../../../services/firebase.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.css'],
})
export class PersonalDataComponent implements OnInit {
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
      fullName: [''],
      cedula: [''],
      phone: [''],
      direction: [''],
    });
  }

  private async loadUserData(): Promise<void> {
    if (!this.userEmail) {
      console.error('Error: Usuario no autenticado.');
      return;
    }

    try {
      const userData = await this.firebaseService.getUserData(this.userEmail);
      this.profileForm.patchValue({
        fullName: userData?.fullName || '',
        cedula: userData?.profileData?.cedula || '',
        phone: userData?.profileData?.phone || '',
        direction: userData?.profileData?.direction || '',
      });
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }
}