import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth'; // Importar Auth y onAuthStateChanged
import { Router } from '@angular/router'; // Importar Router para redireccionar

import { CustomButtonComponent } from '../../../../shared/components/buttons/custom-button/custom-button.component';
import { SidebarComponent } from '../../../../shared/components/buttons/sidebar/sidebar.component';
import { ProfilePictureComponent } from './components/profile-picture/profile-picture.component';
import { PersonalDataComponent } from './components/personal-data/personal-data.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { AboutMeComponent } from './components/about-me/about-me.component';
import { AcademicFormationComponent } from './components/academic-formation/academic-formation.component';
import { LanguagesComponent } from './components/languages/languages.component';
import { SkillsComponent } from './components/skills/skills.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CustomButtonComponent,
    SidebarComponent,
    ProfilePictureComponent,
    PersonalDataComponent,
    ExperienceComponent,
    AboutMeComponent,
    AcademicFormationComponent,
    LanguagesComponent,
    SkillsComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private auth: Auth, // Inyectar Auth de Firebase
    private router: Router // Inyectar Router para redireccionar
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
        this.redirectToLogin(); // Redirigir al login si no está autenticado
      }
    });
  }

  private redirectToLogin(): void {
    this.router.navigate(['/login']); // Redirigir al login
  }
}