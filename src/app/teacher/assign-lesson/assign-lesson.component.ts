import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LessonService } from '../../lesson/lesson.service';
import { GroupService, Group } from '../../admin/services/group.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-assign-lesson',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="assign-lesson">
      <h2>Назначить занятие</h2>
      
      <div class="form-container">
        <form [formGroup]="lessonForm" (ngSubmit)="createLesson()">
          <div class="form-group">
            <label for="subject">Предмет</label>
            <input id="subject" type="text" formControlName="subject" required>
            <div *ngIf="lessonForm.get('subject')?.invalid && lessonForm.get('subject')?.touched" class="error">
              Название предмета обязательно
            </div>
          </div>
          
          <div class="form-group">
            <label for="room">Аудитория</label>
            <input id="room" type="text" formControlName="room" required>
            <div *ngIf="lessonForm.get('room')?.invalid && lessonForm.get('room')?.touched" class="error">
              Номер аудитории обязателен
            </div>
          </div>
          
          <div class="form-group">
            <label>Выберите группы</label>
            <div class="groups-container">
              <div *ngFor="let group of groups" class="group-checkbox">
                <input 
                  type="checkbox" 
                  [id]="'group-' + group.id" 
                  [value]="group.name" 
                  (change)="onGroupSelectionChange($event)"
                  [checked]="selectedGroups.includes(group.name)"
                >
                <label [for]="'group-' + group.id">{{ group.name }}</label>
              </div>
            </div>
            <div *ngIf="!selectedGroups.length && formSubmitted" class="error">
              Выберите хотя бы одну группу
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="startTime">Начало</label>
              <input id="startTime" type="datetime-local" formControlName="startTime" required>
              <div *ngIf="lessonForm.get('startTime')?.invalid && lessonForm.get('startTime')?.touched" class="error">
                Время начала обязательно
              </div>
            </div>
            
            <div class="form-group">
              <label for="endTime">Окончание</label>
              <input id="endTime" type="datetime-local" formControlName="endTime" required>
              <div *ngIf="lessonForm.get('endTime')?.invalid && lessonForm.get('endTime')?.touched" class="error">
                Время окончания обязательно
              </div>
            </div>
          </div>
          
          <button type="submit" [disabled]="isSubmitting">Создать занятие</button>
        </form>
      </div>
      
      <div *ngIf="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .assign-lesson {
      padding: 1rem;
    }
    
    .form-container {
      background-color: #f5f5f5;
      padding: 1.5rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
      max-width: 800px;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .form-group input, .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    .form-row {
      display: flex;
      gap: 1.5rem;
    }
    
    .form-row .form-group {
      flex: 1;
    }
    
    .groups-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
      padding: 0.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    
    .group-checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 180px;
    }
    
    .error {
      color: #d32f2f;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    button[type="submit"] {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }
    
    button[type="submit"]:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    .success-message {
      padding: 1rem;
      background-color: #d4edda;
      color: #155724;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .error-message {
      padding: 1rem;
      background-color: #f8d7da;
      color: #721c24;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
  `]
})
export class AssignLessonComponent implements OnInit {
  lessonForm: FormGroup;
  groups: Group[] = [];
  selectedGroups: string[] = [];
  currentUser: User | null = null;
  
  formSubmitted = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private lessonService: LessonService,
    private groupService: GroupService,
    private authService: AuthService
  ) {
    this.lessonForm = this.fb.group({
      subject: ['', Validators.required],
      room: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadGroups();
  }

  loadGroups(): void {
    this.groupService.getAll().subscribe({
      next: (groups) => {
        this.groups = groups;
      },
      error: (err) => {
        console.error('Failed to load groups', err);
        this.errorMessage = 'Не удалось загрузить список групп';
      }
    });
  }

  onGroupSelectionChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const groupName = checkbox.value;
    
    if (checkbox.checked) {
      if (!this.selectedGroups.includes(groupName)) {
        this.selectedGroups.push(groupName);
      }
    } else {
      this.selectedGroups = this.selectedGroups.filter(g => g !== groupName);
    }
  }

  createLesson(): void {
    this.formSubmitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    if (this.lessonForm.invalid || this.selectedGroups.length === 0) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Create a lesson for each selected group
    const creationPromises = this.selectedGroups.map(groupName => {
      const lessonData = {
        ...this.lessonForm.value,
        teacher: this.currentUser?.id.toString(),
        groupName
      };
      
      return firstValueFrom(this.lessonService.create(lessonData));
    });
    
    Promise.all(creationPromises)
      .then(() => {
        this.successMessage = `Занятие успешно создано для ${this.selectedGroups.length} групп`;
        this.resetForm();
      })
      .catch(err => {
        console.error('Failed to create lessons', err);
        this.errorMessage = 'Не удалось создать занятие';
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }

  resetForm(): void {
    this.lessonForm.reset();
    this.selectedGroups = [];
    this.formSubmitted = false;
  }
}