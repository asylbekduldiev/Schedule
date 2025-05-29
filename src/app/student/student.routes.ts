import { Route } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';

export default [
  {
    path: '',
    component: StudentDashboardComponent,
    children: [
      { path: '', redirectTo: 'calendar', pathMatch: 'full' },
      { path: 'calendar', component: CalendarViewComponent }
    ]
  }
] as Route[];