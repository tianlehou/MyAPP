import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  selectedFile: File | null = null;
  userId: string | null = null;

  constructor(private fb: FormBuilder, private auth: Auth) {}

  ngOnInit(): void {
    // Inicialización del formulario
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern('^\\+?[1-9]\\d{1,14}$')],
      experience: [''],
      profilePicture: [''], // Imagen en Base64 o URL
    });

    // Obtener el usuario autenticado
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.userId = user.uid;
      } else {
        console.error('No se pudo obtener el usuario autenticado.');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profileForm.patchValue({ profilePicture: reader.result });
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.profileForm.valid) {
      alert('Por favor, completa correctamente todos los campos requeridos.');
      return;
    }

    if (!this.userId) {
      alert('Error: Usuario no autenticado.');
      return;
    }

    try {
      const db = getFirestore();
      const userDocRef = doc(db, `users/${this.userId}`);
      let profilePicUrl = '';

      // Subir archivo si existe
      if (this.selectedFile) {
        profilePicUrl = await this.uploadImageToFirebase(this.selectedFile);
      }

      // Guardar datos en Firestore
      const userProfile = {
        ...this.profileForm.value,
        profilePicture: profilePicUrl,
      };

      await setDoc(userDocRef, userProfile, { merge: true });
      alert('Perfil guardado con éxito');
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      alert('Ocurrió un error al guardar el perfil. Inténtalo nuevamente.');
    }
  }

  private async uploadImageToFirebase(file: File): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, `profilePictures/${this.userId}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  async uploadImageToImgBB(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const apiKey = 'TU_API_KEY'; // Reemplaza con tu API key de ImgBB
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    return result.data.url; // URL de la imagen subida
  }
}
