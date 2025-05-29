import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LessonService } from '../../lesson/lesson.service';
import { Lesson } from '../../models/lesson.model';
import { AuthService } from '../../auth/auth.service';

interface StudentInfo {
  id: number;
  groupName?: string;
}

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calendar-view">
      <h2>Календарь занятий</h2>
      
      <div *ngIf="!studentGroupName" class="no-group">
        <p>Вы не привязаны к группе. Обратитесь к администратору.</p>
      </div>
      
      <div *ngIf="studentGroupName" class="group-info">
        <h3>Группа: {{ studentGroupName }}</h3>
      </div>
      
      <div class="date-filters" *ngIf="studentGroupName">
        <div class="filter-group">
          <label for="startDate">С</label>
          <input id="startDate" type="date" [(ngModel)]="startDate" (change)="loadLessons()">
        </div>
        
        <div class="filter-group">
          <label for="endDate">По</label>
          <input id="endDate" type="date" [(ngModel)]="endDate" (change)="loadLessons()">
        </div>
      </div>
      
      <div class="schedule-container" *ngIf="studentGroupName">
        <div *ngIf="isLoading" class="loading">
          Загрузка расписания...
        </div>
        
        <div *ngIf="!isLoading && groupedLessons | keyvalue: dateOrder as days">
          <div *ngIf="days.length === 0" class="no-data">
            Нет занятий в выбранном периоде
          </div>
          
          <div *ngIf="days.length > 0" class="schedule">
            <div *ngFor="let day of days" class="day-container">
              <h3 class="day-header">{{ formatDate(day.key) }}</h3>
              
              <div class="lessons-list">
                <div *ngFor="let lesson of day.value" class="lesson-card">
                  <div class="lesson-time">
                    {{ formatTime(lesson.startTime) }} - {{ formatTime(lesson.endTime) }}
                  </div>
                  
                  <div class="lesson-details">
                    <h4>{{ lesson.subject }}</h4>
                    <div class="lesson-info">
                      <div><strong>Преподаватель:</strong> {{ lesson.teacher }}</div>
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
    .calendar-view {
      padding: 1rem;
    }
    
    .no-group, .no-data, .loading {
      text-align: center;
      padding: 2rem;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-top: 1rem;
      color: #666;
    }
    
    .group-info {
      margin-bottom: 1.5rem;
    }
    
    .date-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .filter-group label {
      font-weight: 500;
    }
    
    .filter-group input {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .day-container {
      margin-bottom: 2rem;
    }
    
    .day-header {
      background-color: #f5f5f5;
      padding: 0.75rem 1rem;
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
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  `]
})
export class CalendarViewComponent implements OnInit {
  studentGroupName?: string;
  lessons: Lesson[] = [];
  groupedLessons: { [date: string]: Lesson[] } = {};
  
  startDate = new Date().toISOString().split('T')[0];
  endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now
  
  isLoading = false;

  constructor(
    private lessonService: LessonService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        // In a real application, you would likely have an API call to get the student's group
        // For now, we'll assume it's stored in the user object or you would make a separate call
        this.fetchStudentGroup(user.id);
      }
    });
  }

  // Mock function - in a real app you would call an API to get the student's group
  fetchStudentGroup(studentId: number): void {
    // This would be replaced with an actual API call
    // For now, we'll simulate a delay and set a mock group
    this.isLoading = true;
    
    setTimeout(() => {
      // This is where you'd assign the group from the API response
      this.studentGroupName = 'Группа А-101'; // Example group name
      this.isLoading = false;
      this.loadLessons();
    }, 500);
  }

  loadLessons(): void {
    if (!this.studentGroupName || !this.startDate || !this.endDate) return;
    
    this.isLoading = true;
    this.lessonService.getRange(this.startDate, this.endDate).subscribe({
      next: (lessons) => {
        // Filter lessons for the student's group
        this.lessons = lessons.filter(lesson => 
          lesson.groupName === this.studentGroupName
        );
        this.groupLessonsByDate();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load lessons', err);
        this.isLoading = false;
      }
    });
  }

  groupLessonsByDate(): void {
    this.groupedLessons = {};
    
    this.lessons.forEach(lesson => {
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

  // Sort the dates in ascending order
  dateOrder = (a: any, b: any) => {
    return new Date(a.key).getTime() - new Date(b.key).getTime();
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