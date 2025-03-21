import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../../../services/firebase.service';
import { get, ref, update } from 'firebase/database';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  userTypeFilter: string = 'all';
  searchQuery: string = '';
  
  // Estadísticas
  totalUsers: number = 0;
  totalCandidates: number = 0;
  totalCompanies: number = 0;

  // Gráfico
  view: [number, number] = [700, 400];
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C']
  };

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    await this.loadUsers();
    this.updateStats();
  }

  async loadUsers() {
    const usersRef = ref(this.firebaseService['db'], 'cv-app/users');
    const snapshot = await get(usersRef);
    this.users = [];
    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      this.users.push({
        key: childSnapshot.key,
        ...user,
        createdAt: user.createdAt ? new Date(user.createdAt) : null,
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null
      });
    });
    this.applyFilters();
  }

  updateStats() {
    this.totalUsers = this.users.length;
    this.totalCandidates = this.users.filter(u => u.role === 'user').length;
    this.totalCompanies = this.users.filter(u => u.role === 'company').length;
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchesType = this.userTypeFilter === 'all' || 
                         user.role === this.userTypeFilter;
      const matchesSearch = user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            user.fullName?.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
    this.updateStats();
  }

  async toggleUserStatus(user: any) {
    const updates = {
      enabled: !user.enabled,
      lastUpdated: new Date().toISOString()
    };
    
    await update(ref(this.firebaseService['db'], `cv-app/users/${user.key}`), updates);
    user.enabled = !user.enabled;
  }

  formatDate(date: Date | null): string {
    return date ? date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Nunca';
  }
}