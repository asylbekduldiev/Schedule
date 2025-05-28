import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { AuthResponse, User } from "../models/user.model";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = '/api/auth';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  loginWithGoogle(googleToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/google`, { token: googleToken }).pipe(
      tap(res => {
        localStorage.setItem('token', res.accessToken);
        this.userSubject.next(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }
}