import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../../../../services/firebase.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-profile-picture',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.css'],
})
export class ProfilePictureComponent implements OnInit {
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
      profilePicture: [''],
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
        profilePicture: userData?.profileData?.profilePicture || '',
      });
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }
}