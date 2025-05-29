import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface Group {
  id: number;
  name: string;
  description?: string;
}

export interface AddUserToGroupRequest {
  userId: number;
  groupId: number;
}

@Injectable({ providedIn: 'root' })
export class GroupService {
  private api = '/api/groups';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Group[]> {
    return this.http.get<Group[]>(this.api);
  }

  getById(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.api}/${id}`);
  }

  create(group: Partial<Group>): Observable<Group> {
    return this.http.post<Group>(this.api, group);
  }

  update(id: number, group: Partial<Group>): Observable<Group> {
    return this.http.put<Group>(`${this.api}/${id}`, group);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  addUserToGroup(request: AddUserToGroupRequest): Observable<void> {
    return this.http.post<void>(`${this.api}/add`, request);
  }

  getUsersByGroup(groupId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${groupId}/users`);
  }
}