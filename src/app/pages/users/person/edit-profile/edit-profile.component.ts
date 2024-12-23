import { Component } from '@angular/core';
import { CustomButtonComponent } from '../../../../shared/components/buttons/custom-button/custom-button.component';
import { ProfilePictureComponent } from './components/profile-picture/profile-picture.component';
import { PersonalDataComponent } from './components/personal-data/personal-data.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { AboutMeComponent } from './components/about-me/about-me.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CustomButtonComponent,
    ProfilePictureComponent,
    PersonalDataComponent,
    ExperienceComponent,
    AboutMeComponent,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent  {}