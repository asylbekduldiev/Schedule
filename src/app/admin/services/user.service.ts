import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "../../models/user.model";

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = '/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.api);
  }

  create(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.api, user);
  }

  assignRole(userId: number, role: 'ADMIN' | 'TEACHER' | 'STUDENT'): Observable<User> {
    return this.http.post<User>(`${this.api}/assign-role`, { userId, role });
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.api}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}