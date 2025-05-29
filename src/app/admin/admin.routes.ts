import { Route } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { GroupManagementComponent } from './group-management/group-management.component';
import { LessonManagementComponent } from './lesson-management/lesson-management.component';
import { ScheduleViewComponent } from './schedule-view/schedule-view.component';

export default [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UserManagementComponent },
      { path: 'groups', component: GroupManagementComponent },
      { path: 'lessons', component: LessonManagementComponent },
      { path: 'schedules', component: ScheduleViewComponent },
    ]
  }
] as Route[];