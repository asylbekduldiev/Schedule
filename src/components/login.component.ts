import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../app/auth/auth.service";

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule],
  template: `
    <button (click)="handleGoogleLogin()">Login with Google</button>
  `
})
export class LoginComponent {
  constructor(private auth: AuthService, private router: Router) {}

  handleGoogleLogin() {
    // googleToken получаешь от Google SDK
    const googleToken = '...'; 
    this.auth.loginWithGoogle(googleToken).subscribe(res => {
      this.router.navigate([`/${res.user.role.toLowerCase()}`]);
    });
  }
}