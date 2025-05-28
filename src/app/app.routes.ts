import { Routes } from '@angular/router';
import { RoleGuard } from './core/guards/role.quard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
  },
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./admin/admin.routes'),
  },
  {
    path: 'teacher',
    canActivate: [RoleGuard],
    data: { roles: ['TEACHER'] },
    loadChildren: () => import('./teacher/teacher.routes'),
  },
  {
    path: 'student',
    canActivate: [RoleGuard],
    data: { roles: ['STUDENT'] },
    loadChildren: () => import('./student/student.routes'),
  },
  { path: '**', redirectTo: 'auth' },
];
