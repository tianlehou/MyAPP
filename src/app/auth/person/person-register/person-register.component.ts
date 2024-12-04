import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-person-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './person-register.component.html',
  styleUrls: ['./person-register.component.css'],
})
export class PersonRegisterComponent {
  registerForm: FormGroup;
  showPassword = false; // Controla la visibilidad de la contraseña
  showConfirmPassword = false; // Controla la visibilidad de la confirmación de contraseña

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      this.authService
        .registerWithEmail(email, password)
        .then(() => {
          alert('Usuario registrado con éxito');
          this.router.navigate(['/login-person']);
        })
        .catch((error) => {
          console.error(error);
          alert('Error al registrar');
        });
    }
  }
}