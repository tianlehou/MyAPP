import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const currentUser = await this.firebaseService.getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}