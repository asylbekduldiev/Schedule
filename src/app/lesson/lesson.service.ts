import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Lesson } from "../models/lesson.model";

@Injectable({ providedIn: 'root' })
export class LessonService {
  private api = '/api/lessons';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(this.api);
  }

  getById(id: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.api}/${id}`);
  }

  create(lesson: Lesson): Observable<Lesson> {
    return this.http.post<Lesson>(this.api, lesson);
  }

  update(id: number, lesson: Lesson): Observable<Lesson> {
    return this.http.put<Lesson>(`${this.api}/${id}`, lesson);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getRange(from: string, to: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.api}/range`, { params: { from, to } });
  }
}