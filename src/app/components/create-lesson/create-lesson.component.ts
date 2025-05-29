import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LessonService } from '../../lesson/lesson.service';
import { Lesson } from '../../models/lesson.model';
import { AuthService } from '../../auth/auth.service';
import { Subject } from '../../models/subject.model';
import { SubjectService } from '../subject-management/subject.service';

@Component({
  standalone: true,
  selector: 'app-create-lesson',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-lesson.component.html',
})
export class CreateLessonComponent {
  groups = ['101', '102', '103']; 
  selectedGroups: string[] = [];
  subjects: Subject[] = [];

  lessonBase: Omit<Lesson, 'groupName' | 'id'> = {
    subject: '',
    teacher: '', 
    room: '',
    startTime: '',
    endTime: '',
  };

constructor(
  private lessonService: LessonService,
  private auth: AuthService,
  private subjectService: SubjectService
) {
  const user = this.auth.currentUser;
  if (user?.role === 'TEACHER') {
    this.lessonBase.teacher = user.name;
  }

  this.subjectService.getAll().subscribe(res => (this.subjects = res));
}

  create() {
    for (const groupName of this.selectedGroups) {
      const lesson = { ...this.lessonBase, groupName };
      this.lessonService.create(lesson as Lesson).subscribe();
    }
  }
}