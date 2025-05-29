import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Subject } from "../../models/subject.model";

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private api = '/api/subjects';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.api);
  }

  create(subject: Partial<Subject>): Observable<Subject> {
    return this.http.post<Subject>(this.api, subject);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}