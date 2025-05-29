import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  imports: [CommonModule, FormsModule],
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  groups: any[] = [];

  newGroupName = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
    this.loadGroups();
  }

  loadUsers() {
    this.http.get<any[]>('/api/users').subscribe(res => (this.users = res));
  }

  loadGroups() {
    this.http.get<any[]>('/api/groups').subscribe(res => (this.groups = res));
  }

  addGroup() {
    this.http.post('/api/groups/add', { name: this.newGroupName }).subscribe(() => {
      this.newGroupName = '';
      this.loadGroups();
    });
  }

  assignRole(userId: number, role: string) {
    this.http.post('/api/users/assign-role', { userId, role }).subscribe(() => this.loadUsers());
  }
}