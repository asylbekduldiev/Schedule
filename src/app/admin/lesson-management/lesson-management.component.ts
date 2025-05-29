import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LessonService } from '../../lesson/lesson.service';
import { Lesson } from '../../models/lesson.model';
import { UserService } from '../services/user.service';
import { GroupService, Group } from '../services/group.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-lesson-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="lesson-management">
      <h2>Управление занятиями</h2>
      
      <div class="actions">
        <button (click)="showAddLessonForm = !showAddLessonForm">
          {{ showAddLessonForm ? 'Отменить' : 'Добавить занятие' }}
        </button>
      </div>
      
      <div class="add-lesson-form" *ngIf="showAddLessonForm">
        <h3>Добавить новое занятие</h3>
        <form [formGroup]="lessonForm" (ngSubmit)="addLesson()">
          <div class="form-group">
            <label for="subject">Предмет</label>
            <input id="subject" type="text" formControlName="subject" required>
            <div *ngIf="lessonForm.get('subject')?.invalid && lessonForm.get('subject')?.touched" class="error">
              Название предмета обязательно
            </div>
          </div>
          
          <div class="form-group">
            <label for="teacher">Преподаватель</label>
            <select id="teacher" formControlName="teacher" required>
              <option [value]="null">Выберите преподавателя</option>
              <option *ngFor="let teacher of teachers" [value]="teacher.id">{{ teacher.name }}</option>
            </select>
            <div *ngIf="lessonForm.get('teacher')?.invalid && lessonForm.get('teacher')?.touched" class="error">
              Выбор преподавателя обязателен
            </div>
          </div>
          
          <div class="form-group">
            <label for="groupName">Группа</label>
            <select id="groupName" formControlName="groupName" required>
              <option [value]="null">Выберите группу</option>
              <option *ngFor="let group of groups" [value]="group.name">{{ group.name }}</option>
            </select>
            <div *ngIf="lessonForm.get('groupName')?.invalid && lessonForm.get('groupName')?.touched" class="error">
              Выбор группы обязателен
            </div>
          </div>
          
          <div class="form-group">
            <label for="room">Аудитория</label>
            <input id="room" type="text" formControlName="room" required>
            <div *ngIf="lessonForm.get('room')?.invalid && lessonForm.get('room')?.touched" class="error">
              Номер аудитории обязателен
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
          
          <button type="submit" [disabled]="lessonForm.invalid">Добавить</button>
        </form>
      </div>
      
      <div class="lesson-filters">
        <h3>Фильтры</h3>
        <div class="filters-container">
          <div class="filter-group">
            <label for="subjectFilter">Предмет</label>
            <input id="subjectFilter" type="text" [(ngModel)]="filters.subject" (input)="applyFilters()">
          </div>
          
          <div class="filter-group">
            <label for="teacherFilter">Преподаватель</label>
            <select id="teacherFilter" [(ngModel)]="filters.teacher" (change)="applyFilters()">
              <option [value]="null">Все преподаватели</option>
              <option *ngFor="let teacher of teachers" [value]="teacher.id">{{ teacher.name }}</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="groupFilter">Группа</label>
            <select id="groupFilter" [(ngModel)]="filters.groupName" (change)="applyFilters()">
              <option [value]="null">Все группы</option>
              <option *ngFor="let group of groups" [value]="group.name">{{ group.name }}</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="dateFilter">Дата</label>
            <input id="dateFilter" type="date" [(ngModel)]="filters.date" (change)="applyFilters()">
          </div>
          
          <button (click)="resetFilters()">Сбросить фильтры</button>
        </div>
      </div>
      
      <div class="lesson-list">
        <h3>Список занятий</h3>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Предмет</th>
              <th>Преподаватель</th>
              <th>Группа</th>
              <th>Аудитория</th>
              <th>Начало</th>
              <th>Окончание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let lesson of filteredLessons">
              <td>{{ lesson.id }}</td>
              <td>
                <span *ngIf="!lesson.editing">{{ lesson.subject }}</span>
                <input *ngIf="lesson.editing" [(ngModel)]="lesson.subject" [ngModelOptions]="{standalone: true}">
              </td>
              <td>
                <span *ngIf="!lesson.editing">{{ getTeacherName(lesson.teacher) }}</span>
                <select *ngIf="lesson.editing" [(ngModel)]="lesson.teacher" [ngModelOptions]="{standalone: true}">
                  <option *ngFor="let teacher of teachers" [value]="teacher.id">{{ teacher.name }}</option>
                </select>
              </td>
              <td>
                <span *ngIf="!lesson.editing">{{ lesson.groupName }}</span>
                <select *ngIf="lesson.editing" [(ngModel)]="lesson.groupName" [ngModelOptions]="{standalone: true}">
                  <option *ngFor="let group of groups" [value]="group.name">{{ group.name }}</option>
                </select>
              </td>
              <td>
                <span *ngIf="!lesson.editing">{{ lesson.room }}</span>
                <input *ngIf="lesson.editing" [(ngModel)]="lesson.room" [ngModelOptions]="{standalone: true}">
              </td>
              <td>
                <span *ngIf="!lesson.editing">{{ formatDateTime(lesson.startTime) }}</span>
                <input *ngIf="lesson.editing" type="datetime-local" [(ngModel)]="lesson.startTime" [ngModelOptions]="{standalone: true}">
              </td>
              <td>
                <span *ngIf="!lesson.editing">{{ formatDateTime(lesson.endTime) }}</span>
                <input *ngIf="lesson.editing" type="datetime-local" [(ngModel)]="lesson.endTime" [ngModelOptions]="{standalone: true}">
              </td>
              <td>
                <div class="action-buttons">
                  <button *ngIf="!lesson.editing" (click)="startEdit(lesson)">Редактировать</button>
                  <button *ngIf="lesson.editing" (click)="saveLesson(lesson)">Сохранить</button>
                  <button *ngIf="lesson.editing" (click)="cancelEdit(lesson)">Отмена</button>
                  <button (click)="deleteLesson(lesson.id)">Удалить</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredLessons.length === 0">
              <td colspan="8" class="no-data">Нет занятий, соответствующих фильтрам</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .lesson-management {
      padding: 1rem;
    }
    
    .actions {
      margin-bottom: 1rem;
    }
    
    .add-lesson-form {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 2rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-row {
      display: flex;
      gap: 1rem;
    }
    
    .form-row .form-group {
      flex: 1;
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
    
    .lesson-filters {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 2rem;
    }
    
    .filters-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-end;
    }
    
    .filter-group {
      flex: 1;
      min-width: 200px;
    }
    
    .filter-group label {
      display: block;
      margin-bottom: 0.5rem;
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
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .no-data {
      text-align: center;
      font-style: italic;
      color: #777;
      padding: 2rem 0;
    }
  `]
})
export class LessonManagementComponent implements OnInit {
  lessons: (Lesson & {
    editing?: boolean;
    originalData?: Partial<Lesson>;
  })[] = [];
  
  filteredLessons: (Lesson & {
    editing?: boolean;
    originalData?: Partial<Lesson>;
  })[] = [];
  
  teachers: User[] = [];
  groups: Group[] = [];
  
  lessonForm: FormGroup;
  showAddLessonForm = false;
  
  filters = {
    subject: null as string | null,
    teacher: null as number | null,
    groupName: null as string | null,
    date: null as string | null
  };

  constructor(
    private lessonService: LessonService,
    private userService: UserService,
    private groupService: GroupService,
    private fb: FormBuilder
  ) {
    this.lessonForm = this.fb.group({
      subject: ['', Validators.required],
      teacher: [null, Validators.required],
      groupName: [null, Validators.required],
      room: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadLessons();
    this.loadTeachers();
    this.loadGroups();
  }

  loadLessons(): void {
    this.lessonService.getAll().subscribe(lessons => {
      this.lessons = lessons.map(lesson => ({
        ...lesson,
        editing: false
      }));
      this.applyFilters();
    });
  }

  loadTeachers(): void {
    this.userService.getAll().subscribe(users => {
      this.teachers = users.filter(user => user.role === 'TEACHER');
    });
  }

  loadGroups(): void {
    this.groupService.getAll().subscribe(groups => {
      this.groups = groups;
    });
  }

  addLesson(): void {
    if (this.lessonForm.invalid) return;
    
    const lessonData = this.lessonForm.value;
    
    this.lessonService.create(lessonData).subscribe({
      next: (newLesson) => {
        this.lessons.push({
          ...newLesson,
          editing: false
        });
        this.applyFilters();
        this.lessonForm.reset();
        this.showAddLessonForm = false;
      },
      error: (err) => {
        console.error('Failed to create lesson', err);
        alert('Не удалось создать занятие');
      }
    });
  }

  startEdit(lesson: any): void {
    lesson.originalData = { ...lesson };
    lesson.editing = true;
  }

  cancelEdit(lesson: any): void {
    if (lesson.originalData) {
      Object.assign(lesson, lesson.originalData);
    }
    lesson.editing = false;
  }

  saveLesson(lesson: any): void {
    this.lessonService.update(lesson.id, lesson).subscribe({
      next: () => {
        lesson.editing = false;
      },
      error: (err) => {
        console.error('Failed to update lesson', err);
        alert('Не удалось обновить занятие');
        this.cancelEdit(lesson);
      }
    });
  }

  deleteLesson(id: number): void {
    if (confirm('Вы уверены, что хотите удалить это занятие?')) {
      this.lessonService.delete(id).subscribe({
        next: () => {
          this.lessons = this.lessons.filter(lesson => lesson.id !== id);
          this.applyFilters();
        },
        error: (err) => {
          console.error('Failed to delete lesson', err);
          alert('Не удалось удалить занятие');
        }
      });
    }
  }

  applyFilters(): void {
    this.filteredLessons = this.lessons.filter(lesson => {
      let match = true;
      
      if (this.filters.subject) {
        match = match && lesson.subject.toLowerCase().includes(this.filters.subject.toLowerCase());
      }
      
      if (this.filters.teacher) {
        match = match && lesson.teacher === this.filters.teacher.toString();
      }
      
      if (this.filters.groupName) {
        match = match && lesson.groupName === this.filters.groupName;
      }
      
      if (this.filters.date) {
        const filterDate = new Date(this.filters.date);
        const lessonDate = new Date(lesson.startTime);
        match = match && 
          filterDate.getFullYear() === lessonDate.getFullYear() && 
          filterDate.getMonth() === lessonDate.getMonth() && 
          filterDate.getDate() === lessonDate.getDate();
      }
      
      return match;
    });
  }

  resetFilters(): void {
    this.filters = {
      subject: null,
      teacher: null,
      groupName: null,
      date: null
    };
    this.applyFilters();
  }

  getTeacherName(teacherId: string): string {
    const teacher = this.teachers.find(t => t.id.toString() === teacherId);
    return teacher ? teacher.name : 'Неизвестный преподаватель';
  }

  formatDateTime(dateTimeStr: string): string {
    const date = new Date(dateTimeStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}