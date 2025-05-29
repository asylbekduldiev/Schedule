import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Расписание занятий</h1>
        <p>Войдите, чтобы получить доступ к системе</p>
        
        <div id="google-signin-button" class="google-signin-button"></div>
        
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    
    .login-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    
    h1 {
      margin-bottom: 0.5rem;
      color: #333;
    }
    
    p {
      margin-bottom: 2rem;
      color: #666;
    }
    
    .google-signin-button {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }
    
    .error-message {
      color: #d32f2f;
      margin-top: 1rem;
      padding: 0.5rem;
      background-color: #ffebee;
      border-radius: 4px;
    }
  `]
})
export class LoginComponent implements OnInit {
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initGoogleSignIn();
  }

  initGoogleSignIn(): void {
    // Wait for Google SDK to load
    window.onload = () => {
      google.accounts.id.initialize({
        client_id: '123456789-your-google-client-id.apps.googleusercontent.com', // Replace with your actual client ID
        callback: this.handleGoogleSignIn.bind(this)
      });
      
      google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large', width: 300 }
      );
    };
  }

  handleGoogleSignIn(response: any): void {
    if (response && response.credential) {
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: (authResponse) => {
          const user = authResponse.user;
          
          // Redirect based on user role
          switch (user.role) {
            case 'ADMIN':
              this.router.navigate(['/admin']);
              break;
            case 'TEACHER':
              this.router.navigate(['/teacher']);
              break;
            case 'STUDENT':
              this.router.navigate(['/student']);
              break;
            default:
              this.errorMessage = 'Неизвестная роль пользователя';
          }
        },
        error: (error) => {
          console.error('Login failed', error);
          this.errorMessage = 'Ошибка входа в систему';
        }
      });
    } else {
      this.errorMessage = 'Ошибка аутентификации через Google';
    }
  }
}