import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { RouterModule } from '@angular/router'; // Importa RouterModule

@Component({
  selector: 'app-person-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './person-login.component.html',
  styleUrls: ['./person-login.component.css'],
})
export class PersonLoginComponent {
  loginForm: FormGroup;
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    const { email, password } = this.loginForm.value;
    if (this.loginForm.valid) {
      this.authService
        .loginWithEmail(email, password)
        .then(() => {
          alert('Inicio de sesión exitoso');
        })
        .catch((error) => {
          console.error(error);
          alert('Error al iniciar sesión');
        });
    }
  }
}
