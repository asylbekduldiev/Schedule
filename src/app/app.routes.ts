import { Routes } from '@angular/router';
import { RoleGuard } from './core/guards/role.quard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'teacher',
    canActivate: [RoleGuard],
    data: { roles: ['TEACHER'] },
    loadComponent: () => import('./teacher/teacher-schedule.component').then(m => m.TeacherScheduleComponent)
  },
  {
    path: 'student',
    canActivate: [RoleGuard],
    data: { roles: ['STUDENT'] },
    loadComponent: () => import('./student/student-calendar.component').then(m => m.StudentCalendarComponent)
  },
  {
    path: 'auth',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth' },
];
