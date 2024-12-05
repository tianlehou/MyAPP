import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

import { PersonRegisterComponent } from './auth/person/person-register/person-register.component';
import { PersonLoginComponent } from './auth/person/person-login/person-login.component';
import { ForgotPasswordComponent } from './auth/person/person-forgot-password/person-forgot-password.component';
import { ProfileComponent } from './pages/users/person/profile/profile.component';
import { CompanyRegisterComponent } from './auth/bussiness/company-register/company-register.component';
import { SubscriptionComponent } from './pages/subscription/subscription.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'signup-person', component: PersonRegisterComponent },
  { path: 'login-person', component: PersonLoginComponent },
  { path: 'forgot-password-person', component: ForgotPasswordComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'signup-company', component: CompanyRegisterComponent },
  { path: 'suscripciones', component: SubscriptionComponent },
  { path: '**', redirectTo: 'home' },
];
