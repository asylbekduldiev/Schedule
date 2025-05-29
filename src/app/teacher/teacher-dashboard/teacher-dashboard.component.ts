import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="teacher-dashboard">
      <header class="dashboard-header">
        <h1>Панель преподавателя</h1>
        <div class="user-info" *ngIf="currentUser">
          <span>{{ currentUser.name }}</span>
          <button (click)="logout()">Выйти</button>
        </div>
      </header>
      
      <div class="dashboard-container">
        <nav class="sidebar">
          <ul>
            <li><a routerLink="schedule" routerLinkActive="active">Моё расписание</a></li>
            <li><a routerLink="assign-lesson" routerLinkActive="active">Назначить занятие</a></li>
          </ul>
        </nav>
        
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .teacher-dashboard {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .dashboard-container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    
    .sidebar {
      width: 250px;
      background-color: #f5f5f5;
      padding: 1rem;
      border-right: 1px solid #e0e0e0;
    }
    
    .sidebar ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .sidebar li {
      margin-bottom: 0.5rem;
    }
    
    .sidebar a {
      display: block;
      padding: 0.75rem 1rem;
      color: #333;
      text-decoration: none;
      border-radius: 4px;
    }
    
    .sidebar a:hover {
      background-color: #e0e0e0;
    }
    
    .sidebar a.active {
      background-color: #007bff;
      color: white;
    }
    
    .content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}