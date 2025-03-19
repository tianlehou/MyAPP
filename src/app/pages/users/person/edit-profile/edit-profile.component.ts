import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Database, ref, get } from '@angular/fire/database';

// Custom components
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
  userRole: string | null = null;

  constructor(private auth: Auth, private db: Database) {}

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
