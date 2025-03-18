import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { CustomButtonComponent } from '../../../../shared/components/buttons/custom-button/custom-button.component';
import { EditProfilePictureComponent } from './components/edit-profile-picture/edit-profile-picture.component';
import { EditPersonalDataComponent } from './components/edit-personal-data/edit-personal-data.component';
import { EditExperienceComponent } from './components/edit-experience/edit-experience.component';
import { EditAboutMeComponent } from './components/edit-about-me/edit-about-me.component';
import { EditAcademicFormationComponent } from './components/edit-academic-formation/edit-academic-formation.component';
import { EditLanguagesComponent } from './components/edit-languages/edit-languages.component';
import { EditSkillsComponent } from './components/edit-skills/edit-skills.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CustomButtonComponent,

    EditProfilePictureComponent,
    EditPersonalDataComponent,
    EditExperienceComponent,
    EditAboutMeComponent,
    EditAcademicFormationComponent,
    EditLanguagesComponent,
    EditSkillsComponent,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.detectAuthenticatedUser();
  }

  private detectAuthenticatedUser(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.currentUser = user;
        console.log('Usuario autenticado:', user.email);
      } else {
        console.error('No se pudo obtener el usuario autenticado.');
        this.redirectToLogin();
      }
    });
  }

  private redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}