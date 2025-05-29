import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../../models/user.model';
import { GroupService, Group } from '../services/group.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="user-management">
      <h2>Управление пользователями</h2>
      
      <div class="actions">
        <button (click)="showAddUserForm = !showAddUserForm">
          {{ showAddUserForm ? 'Отменить' : 'Добавить пользователя' }}
        </button>
      </div>
      
      <div class="add-user-form" *ngIf="showAddUserForm">
        <h3>Добавить нового пользователя</h3>
        <form [formGroup]="userForm" (ngSubmit)="addUser()">
          <div class="form-group">
            <label for="name">Имя</label>
            <input id="name" type="text" formControlName="name" required>
            <div *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched" class="error">
              Имя обязательно
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" required>
            <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="error">
              Введите корректный email
            </div>
          </div>
          
          <div class="form-group">
            <label for="role">Роль</label>
            <select id="role" formControlName="role" required>
              <option value="ADMIN">Администратор</option>
              <option value="TEACHER">Преподаватель</option>
              <option value="STUDENT">Студент</option>
            </select>
          </div>
          
          <div class="form-group" *ngIf="userForm.get('role')?.value === 'STUDENT'">
            <label for="group">Группа</label>
            <select id="group" formControlName="groupId">
              <option [value]="null">Выберите группу</option>
              <option *ngFor="let group of groups" [value]="group.id">{{ group.name }}</option>
            </select>
          </div>
          
          <button type="submit" [disabled]="userForm.invalid">Добавить</button>
        </form>
      </div>
      
      <div class="user-list">
        <h3>Список пользователей</h3>
        
        <div class="filters">
          <select [(ngModel)]="roleFilter" (change)="applyFilters()">
            <option value="all">Все роли</option>
            <option value="ADMIN">Администраторы</option>
            <option value="TEACHER">Преподаватели</option>
            <option value="STUDENT">Студенты</option>
          </select>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of filteredUsers">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <select [(ngModel)]="user.role" (change)="changeRole(user)">
                  <option value="ADMIN">Администратор</option>
                  <option value="TEACHER">Преподаватель</option>
                  <option value="STUDENT">Студент</option>
                </select>
              </td>
              <td>
                <button (click)="deleteUser(user.id)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .user-management {
      padding: 1rem;
    }
    
    .actions {
      margin-bottom: 1rem;
    }
    
    .add-user-form {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 2rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
    }
    
    .form-group input, .form-group select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .error {
      color: red;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    
    th {
      background-color: #f5f5f5;
    }
    
    .filters {
      margin-bottom: 1rem;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  groups: Group[] = [];
  userForm: FormGroup;
  showAddUserForm = false;
  roleFilter = 'all';

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['STUDENT', Validators.required],
      groupId: [null]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadGroups();
    
    // When role changes, reset group if needed
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      if (role !== 'STUDENT') {
        this.userForm.get('groupId')?.setValue(null);
      }
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe(users => {
      this.users = users;
      this.applyFilters();
    });
  }

  loadGroups(): void {
    this.groupService.getAll().subscribe(groups => {
      this.groups = groups;
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      if (this.roleFilter === 'all') return true;
      return user.role === this.roleFilter;
    });
  }

  addUser(): void {
    if (this.userForm.invalid) return;
    
    const userData = this.userForm.value;
    this.userService.create(userData).subscribe({
      next: (newUser) => {
        this.users.push(newUser);
        this.applyFilters();
        this.userForm.reset({
          role: 'STUDENT',
          groupId: null
        });
        this.showAddUserForm = false;
        
        // If student and group selected, add to group
        if (newUser.role === 'STUDENT' && userData.groupId) {
          this.groupService.addUserToGroup({
            userId: newUser.id,
            groupId: userData.groupId
          }).subscribe();
        }
      },
      error: (err) => {
        console.error('Failed to create user', err);
        alert('Не удалось создать пользователя');
      }
    });
  }

  changeRole(user: User): void {
    this.userService.assignRole(user.id, user.role).subscribe({
      error: (err) => {
        console.error('Failed to change role', err);
        alert('Не удалось изменить роль');
        this.loadUsers(); // Reload to reset UI
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== id);
          this.applyFilters();
        },
        error: (err) => {
          console.error('Failed to delete user', err);
          alert('Не удалось удалить пользователя');
        }
      });
    }
  }
}