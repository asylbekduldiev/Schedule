import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LessonService } from '../../app/lesson/lesson.service';
import { Lesson } from '../../app/models/lesson.model';
import { AuthService } from '../../app/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-create-lesson',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-lesson.component.html',
})
export class CreateLessonComponent {
  groups = ['101', '102', '103']; 
  selectedGroups: string[] = [];

  lessonBase: Omit<Lesson, 'groupName' | 'id'> = {
    subject: '',
    teacher: '', 
    room: '',
    startTime: '',
    endTime: '',
  };

constructor(
  private lessonService: LessonService,
  private auth: AuthService
) {
  const user = this.auth.currentUser;
  if (user?.role === 'TEACHER') {
    this.lessonBase.teacher = user.name;
  }
}

  create() {
    for (const groupName of this.selectedGroups) {
      const lesson = { ...this.lessonBase, groupName };
      this.lessonService.create(lesson as Lesson).subscribe();
    }
  }
}