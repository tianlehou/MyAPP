import { Injectable } from '@angular/core';
import { CanMatch, Route, Router } from '@angular/router';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Database, ref, get } from '@angular/fire/database';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanMatch {
  constructor(private auth: Auth, private db: Database, private router: Router) {}

  async canMatch(route: Route): Promise<boolean> {
    const user = await new Promise<User | null>((resolve) => onAuthStateChanged(this.auth, resolve));
    if (!user || !user.email) return this.redirect();

    const snapshot = await get(ref(this.db, `cv-app/users/${user.email.replace(/\./g, '_')}`));
    return snapshot.exists() && snapshot.val().role === route.data?.['role'] ? true : this.redirect();
  }

  private redirect(): boolean { this.router.navigate(['/login-person']);
    return false };
}