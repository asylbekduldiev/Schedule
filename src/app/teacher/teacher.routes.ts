import { Route } from '@angular/router';
import { TeacherDashboardComponent } from './teacher-dashboard/teacher-dashboard.component';
import { ScheduleViewComponent } from './schedule-view/schedule-view.component';
import { AssignLessonComponent } from './assign-lesson/assign-lesson.component';

export default [
  {
    path: '',
    component: TeacherDashboardComponent,
    children: [
      { path: '', redirectTo: 'schedule', pathMatch: 'full' },
      { path: 'schedule', component: ScheduleViewComponent },
      { path: 'assign-lesson', component: AssignLessonComponent }
    ]
  }
] as Route[];