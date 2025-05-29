import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { LessonService } from "../../lesson/lesson.service";
import { Lesson } from "../../models/lesson.model";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teacher-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.scss'],
})
export class TeacherScheduleComponent implements OnInit {
  lessons: Lesson[] = [];
  groups: string[] = [];
  selectedGroup: string = '';

  constructor(private lessonService: LessonService) {}

  ngOnInit() {
    this.loadSchedule();
  }

loadSchedule() {
  const from = this.getMonday().toISOString();
  const to = this.getFriday().toISOString();

  this.lessonService.getRange(from, to).subscribe(res => {
    this.lessons = this.selectedGroup
      ? res.filter(lesson => lesson.groupName === this.selectedGroup)
      : res;

    this.groups = [...new Set(res.map(l => l.groupName))];
  });
}

  getMonday(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  }

  getFriday(): Date {
    const monday = this.getMonday();
    return new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000);
  }
}