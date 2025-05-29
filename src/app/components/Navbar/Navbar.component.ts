import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "../../auth/auth.service";
import { User } from "../../models/user.model";

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  template: `
    <nav *ngIf="user">
      <a *ngIf="user.role === 'ADMIN'" routerLink="/admin">Админка</a>
      <a *ngIf="user.role === 'TEACHER'" routerLink="/teacher">Расписание</a>
      <a *ngIf="user.role === 'STUDENT'" routerLink="/student">Календарь</a>
      <button (click)="logout()">Выйти</button>
    </nav>
  `
})
export class NavbarComponent {
    user: User | null = null;

    constructor(private auth: AuthService, private router: Router) {
    this.user = this.auth.currentUser;
    }
  logout() {
    this.auth.logout();
    this.router.navigate(['/auth']);
  }
}