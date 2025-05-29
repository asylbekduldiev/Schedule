import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LessonService } from '../../lesson/lesson.service';
import { Lesson } from '../../models/lesson.model';
import { GroupService, Group } from '../../admin/services/group.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-schedule-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="schedule-view">
      <h2>Моё расписание</h2>
      
      <div class="filters">
        <div class="filter-group">
          <label for="groupFilter">Фильтр по группе</label>
          <select id="groupFilter" [(ngModel)]="selectedGroup" (change)="applyFilters()">
            <option [value]="null">Все группы</option>
            <option *ngFor="let group of groups" [value]="group.name">{{ group.name }}</option>
          </select>
        </div>
      </div>
      
      <div class="schedule-container">
        <div *ngIf="isLoading" class="loading">
          Загрузка расписания...
        </div>
        
        <div *ngIf="!isLoading && filteredLessons.length === 0" class="no-data">
          Нет занятий в ближайшие 5 рабочих дней
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
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .filter-group {
      flex: 1;
      max-width: 300px;
    }
    
    .filter-group label {
      display: block;
      margin-bottom: 0.5rem;
    }
    
    .filter-group select {
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
  selectedGroup: string | null = null;
  
  isLoading = false;
  currentTeacherId: number | null = null;

  constructor(
    private lessonService: LessonService,
    private groupService: GroupService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentTeacherId = user.id;
        this.loadSchedule();
      }
    });
    
    this.loadGroups();
  }

  loadGroups(): void {
    this.groupService.getAll().subscribe(groups => {
      this.groups = groups;
    });
  }

  loadSchedule(): void {
    if (!this.currentTeacherId) return;
    
    this.isLoading = true;
    
    // Calculate date range for next 5 working days
    const startDate = new Date();
    const endDate = this.getNextWorkingDays(startDate, 5);
    
    this.lessonService.getRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    ).subscribe({
      next: (lessons) => {
        // Filter lessons for current teacher
        this.lessons = lessons.filter(lesson => 
          lesson.teacher === this.currentTeacherId?.toString()
        );
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
      if (this.selectedGroup) {
        return lesson.groupName === this.selectedGroup;
      }
      return true;
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

  getNextWorkingDays(startDate: Date, numDays: number): Date {
    const endDate = new Date(startDate);
    let daysAdded = 0;
    
    while (daysAdded < numDays) {
      endDate.setDate(endDate.getDate() + 1);
      // Skip weekends (0 = Sunday, 6 = Saturday)
      const dayOfWeek = endDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    
    return endDate;
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
}