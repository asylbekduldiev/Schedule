import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LessonService } from '../../lesson/lesson.service';
import { Lesson } from '../../models/lesson.model';
import { GroupService, Group } from '../services/group.service';
import { UserService } from '../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-schedule-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="schedule-view">
      <h2>Просмотр расписания</h2>
      
      <div class="filters">
        <div class="date-filters">
          <div class="filter-group">
            <label for="startDate">С</label>
            <input id="startDate" type="date" [(ngModel)]="startDate" (change)="loadSchedule()">
          </div>
          
          <div class="filter-group">
            <label for="endDate">По</label>
            <input id="endDate" type="date" [(ngModel)]="endDate" (change)="loadSchedule()">
          </div>
        </div>
        
        <div class="entity-filters">
          <div class="filter-group">
            <label for="groupFilter">Группа</label>
            <select id="groupFilter" [(ngModel)]="selectedGroup" (change)="applyFilters()">
              <option [value]="null">Все группы</option>
              <option *ngFor="let group of groups" [value]="group.name">{{ group.name }}</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="teacherFilter">Преподаватель</label>
            <select id="teacherFilter" [(ngModel)]="selectedTeacher" (change)="applyFilters()">
              <option [value]="null">Все преподаватели</option>
              <option *ngFor="let teacher of teachers" [value]="teacher.id">{{ teacher.name }}</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="schedule-container">
        <div *ngIf="isLoading" class="loading">
          Загрузка расписания...
        </div>
        
        <div *ngIf="!isLoading && filteredLessons.length === 0" class="no-data">
          Нет занятий в выбранном периоде
        </div>
        
        <div *ngIf="!isLoading && filteredLessons.length > 0" class="schedule">
          <div class="calendar-view">
            <div *ngFor="let day of groupedLessons | keyvalue" class="day-container">
              <h3 class="day-header">{{ formatDate(day.key) }}</h3>
              
              <div class="lessons-list">
                <div *ngFor="let lesson of day.value" class="lesson-card">
                  <div class="lesson-time">
                    {{ formatTime(lesson.startTime) }} - {{ formatTime(lesson.endTime) }}
                  </div>
                  
                  <div class="lesson-details">
                    <h4>{{ lesson.subject }}</h4>
                    <div class="lesson-info">
                      <div><strong>Преподаватель:</strong> {{ getTeacherName(lesson.teacher) }}</div>
                      <div><strong>Группа:</strong> {{ lesson.groupName }}</div>
                      <div><strong>Аудитория:</strong> {{ lesson.room }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .schedule-view {
      padding: 1rem;
    }
    
    .filters {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 2rem;
    }
    
    .date-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .entity-filters {
      display: flex;
      gap: 1rem;
    }
    
    .filter-group {
      flex: 1;
    }
    
    .filter-group label {
      display: block;
      margin-bottom: 0.5rem;
    }
    
    .filter-group input, .filter-group select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .loading, .no-data {
      text-align: center;
      padding: 2rem;
      color: #777;
    }
    
    .calendar-view {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .day-header {
      background-color: #f5f5f5;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .lessons-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .lesson-card {
      display: flex;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .lesson-time {
      background-color: #007bff;
      color: white;
      padding: 1rem;
      min-width: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    
    .lesson-details {
      padding: 1rem;
      flex: 1;
    }
    
    .lesson-details h4 {
      margin-top: 0;
      margin-bottom: 0.5rem;
    }
    
    .lesson-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
  `]
})
export class ScheduleViewComponent implements OnInit {
  lessons: Lesson[] = [];
  filteredLessons: Lesson[] = [];
  groupedLessons: { [date: string]: Lesson[] } = {};
  
  groups: Group[] = [];
  teachers: User[] = [];
  
  startDate: string = new Date().toISOString().split('T')[0]; // Today
  endDate: string = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Week from today
  
  selectedGroup: string | null = null;
  selectedTeacher: number | null = null;
  
  isLoading = false;

  constructor(
    private lessonService: LessonService,
    private groupService: GroupService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.loadTeachers();
    this.loadSchedule();
  }

  loadGroups(): void {
    this.groupService.getAll().subscribe(groups => {
      this.groups = groups;
    });
  }

  loadTeachers(): void {
    this.userService.getAll().subscribe(users => {
      this.teachers = users.filter(user => user.role === 'TEACHER');
    });
  }

  loadSchedule(): void {
    if (!this.startDate || !this.endDate) return;
    
    this.isLoading = true;
    this.lessonService.getRange(this.startDate, this.endDate).subscribe({
      next: (lessons) => {
        this.lessons = lessons;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load lessons', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredLessons = this.lessons.filter(lesson => {
      let match = true;
      
      if (this.selectedGroup) {
        match = match && lesson.groupName === this.selectedGroup;
      }
      
      if (this.selectedTeacher) {
        match = match && lesson.teacher === this.selectedTeacher.toString();
      }
      
      return match;
    });
    
    this.groupLessonsByDate();
  }

  groupLessonsByDate(): void {
    this.groupedLessons = {};
    
    this.filteredLessons.forEach(lesson => {
      const date = new Date(lesson.startTime).toISOString().split('T')[0];
      
      if (!this.groupedLessons[date]) {
        this.groupedLessons[date] = [];
      }
      
      this.groupedLessons[date].push(lesson);
    });
    
    // Sort lessons within each day by start time
    for (const date in this.groupedLessons) {
      this.groupedLessons[date].sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('ru-RU', options);
  }

  formatTime(dateTimeStr: string): string {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getTeacherName(teacherId: string): string {
    const teacher = this.teachers.find(t => t.id.toString() === teacherId);
    return teacher ? teacher.name : 'Неизвестный преподаватель';
  }
}