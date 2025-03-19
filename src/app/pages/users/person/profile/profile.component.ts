import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Database, ref, get } from '@angular/fire/database'; // Importar Database

// Custom components
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
  userRole: string | null = null;

  constructor(private auth: Auth, private db: Database) {} // Inyectar Database

  ngOnInit(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.currentUser = user;
        console.log('Usuario autenticado:', user.email);

        // Obtener el rol del usuario desde la base de datos
        const userEmailKey = user.email ? user.email.replace(/\./g, '_') : '';
        const userRef = ref(this.db, `cv-app/users/${userEmailKey}`);

        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            this.userRole = userData.role; // Obtener el rol
            console.log('Rol del usuario:', this.userRole);
          } else {
            console.log('No se encontraron datos del usuario.');
          }
        } catch (error) {
          console.error('Error al obtener el rol:', error);
        }
      }
    });
  }
}