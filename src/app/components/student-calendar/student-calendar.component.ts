import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../auth/auth.service";
import { LessonService } from "../../lesson/lesson.service";
import { Lesson } from "../../models/lesson.model";

@Component({
  standalone: true,
  selector: 'app-student-calendar',
  templateUrl: './student-calendar.component.html',
  imports: [CommonModule],
})
export class StudentCalendarComponent implements OnInit {
  lessons: Lesson[] = [];

  constructor(private lessonService: LessonService, private auth: AuthService) {}

  ngOnInit() {
    const from = new Date();
    const to = new Date();
    to.setDate(from.getDate() + 7);

    this.lessonService.getRange(from.toISOString(), to.toISOString()).subscribe(res => {
      const group = this.auth.currentUser?.groupName;
      this.lessons = res.filter(lesson => lesson.groupName === group);
    });
  }
}