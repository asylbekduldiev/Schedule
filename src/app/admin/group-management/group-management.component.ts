import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroupService, Group } from '../services/group.service';
import { UserService } from '../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="group-management">
      <h2>Управление группами</h2>
      
      <div class="actions">
        <button (click)="showAddGroupForm = !showAddGroupForm">
          {{ showAddGroupForm ? 'Отменить' : 'Добавить группу' }}
        </button>
      </div>
      
      <div class="add-group-form" *ngIf="showAddGroupForm">
        <h3>Добавить новую группу</h3>
        <form [formGroup]="groupForm" (ngSubmit)="addGroup()">
          <div class="form-group">
            <label for="name">Название группы</label>
            <input id="name" type="text" formControlName="name" required>
            <div *ngIf="groupForm.get('name')?.invalid && groupForm.get('name')?.touched" class="error">
              Название обязательно
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">Описание</label>
            <textarea id="description" formControlName="description" rows="3"></textarea>
          </div>
          
          <button type="submit" [disabled]="groupForm.invalid">Добавить</button>
        </form>
      </div>
      
      <div class="group-list">
        <h3>Список групп</h3>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let group of groups">
              <td>{{ group.id }}</td>
              <td>
                <span *ngIf="!group.editing">{{ group.name }}</span>
                <input *ngIf="group.editing" [(ngModel)]="group.name" [ngModelOptions]="{standalone: true}">
              </td>
              <td>
                <span *ngIf="!group.editing">{{ group.description || '-' }}</span>
                <textarea *ngIf="group.editing" [(ngModel)]="group.description" [ngModelOptions]="{standalone: true}" rows="2"></textarea>
              </td>
              <td>
                <div class="action-buttons">
                  <button *ngIf="!group.editing" (click)="startEdit(group)">Редактировать</button>
                  <button *ngIf="group.editing" (click)="saveGroup(group)">Сохранить</button>
                  <button *ngIf="group.editing" (click)="cancelEdit(group)">Отмена</button>
                  <button (click)="deleteGroup(group.id)">Удалить</button>
                  <button (click)="toggleStudents(group)">
                    {{ group.showStudents ? 'Скрыть студентов' : 'Показать студентов' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngFor="let group of groups" [hidden]="!group.showStudents">
              <td colspan="4" class="students-container">
                <div class="students-list">
                  <h4>Студенты в группе "{{ group.name }}"</h4>
                  
                  <div class="add-student">
                    <select [(ngModel)]="group.selectedStudent">
                      <option [value]="null">Выберите студента</option>
                      <option *ngFor="let student of availableStudents" [value]="student.id">
                        {{ student.name }} ({{ student.email }})
                      </option>
                    </select>
                    <button [disabled]="!group.selectedStudent" (click)="addStudentToGroup(group)">Добавить</button>
                  </div>
                  
                  <table class="students-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let student of group.students">
                        <td>{{ student.id }}</td>
                        <td>{{ student.name }}</td>
                        <td>{{ student.email }}</td>
                        <td>
                          <button (click)="removeStudentFromGroup(group, student.id)">Удалить</button>
                        </td>
                      </tr>
                      <tr *ngIf="!group.students || group.students.length === 0">
                        <td colspan="4" class="no-data">Нет студентов в группе</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .group-management {
      padding: 1rem;
    }
    
    .actions {
      margin-bottom: 1rem;
    }
    
    .add-group-form {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 2rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
    }
    
    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .error {
      color: red;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }
    
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    
    th {
      background-color: #f5f5f5;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .students-container {
      background-color: #f9f9f9;
      padding: 1rem;
    }
    
    .students-list {
      margin-top: 1rem;
    }
    
    .add-student {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .add-student select {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .students-table {
      width: 100%;
      margin-top: 1rem;
    }
    
    .no-data {
      text-align: center;
      font-style: italic;
      color: #777;
    }
  `]
})
export class GroupManagementComponent implements OnInit {
  groups: (Group & {
    editing?: boolean;
    showStudents?: boolean;
    students?: User[];
    originalData?: Partial<Group>;
    selectedStudent?: number | null;
  })[] = [];
  
  availableStudents: User[] = [];
  groupForm: FormGroup;
  showAddGroupForm = false;

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadGroups();
    this.loadStudents();
  }

  loadGroups(): void {
    this.groupService.getAll().subscribe(groups => {
      this.groups = groups.map(group => ({
        ...group,
        editing: false,
        showStudents: false,
        students: [],
        selectedStudent: null
      }));
    });
  }

  loadStudents(): void {
    this.userService.getAll().subscribe(users => {
      this.availableStudents = users.filter(user => user.role === 'STUDENT');
    });
  }

  addGroup(): void {
    if (this.groupForm.invalid) return;
    
    this.groupService.create(this.groupForm.value).subscribe({
      next: (newGroup) => {
        this.groups.push({
          ...newGroup,
          editing: false,
          showStudents: false,
          students: [],
          selectedStudent: null
        });
        this.groupForm.reset();
        this.showAddGroupForm = false;
      },
      error: (err) => {
        console.error('Failed to create group', err);
        alert('Не удалось создать группу');
      }
    });
  }

  startEdit(group: any): void {
    group.originalData = { name: group.name, description: group.description };
    group.editing = true;
  }

  cancelEdit(group: any): void {
    if (group.originalData) {
      group.name = group.originalData.name;
      group.description = group.originalData.description;
    }
    group.editing = false;
  }

  saveGroup(group: any): void {
    this.groupService.update(group.id, {
      name: group.name,
      description: group.description
    }).subscribe({
      next: () => {
        group.editing = false;
      },
      error: (err) => {
        console.error('Failed to update group', err);
        alert('Не удалось обновить группу');
        this.cancelEdit(group);
      }
    });
  }

  deleteGroup(id: number): void {
    if (confirm('Вы уверены, что хотите удалить эту группу?')) {
      this.groupService.delete(id).subscribe({
        next: () => {
          this.groups = this.groups.filter(group => group.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete group', err);
          alert('Не удалось удалить группу');
        }
      });
    }
  }

  toggleStudents(group: any): void {
    group.showStudents = !group.showStudents;
    
    if (group.showStudents && (!group.students || group.students.length === 0)) {
      this.loadGroupStudents(group);
    }
  }

  loadGroupStudents(group: any): void {
    this.groupService.getUsersByGroup(group.id).subscribe(students => {
      group.students = students;
    });
  }

  addStudentToGroup(group: any): void {
    if (!group.selectedStudent) return;
    
    this.groupService.addUserToGroup({
      userId: group.selectedStudent,
      groupId: group.id
    }).subscribe({
      next: () => {
        // Find the selected student from available students
        const student = this.availableStudents.find(s => s.id === +group.selectedStudent!);
        if (student) {
          group.students.push(student);
        }
        group.selectedStudent = null;
      },
      error: (err) => {
        console.error('Failed to add student to group', err);
        alert('Не удалось добавить студента в группу');
      }
    });
  }

  removeStudentFromGroup(group: any, studentId: number): void {
    if (confirm('Вы уверены, что хотите удалить студента из группы?')) {
      // Note: API endpoint may differ based on backend implementation
      // This is a placeholder, adjust according to your actual API
      this.groupService.addUserToGroup({
        userId: studentId,
        groupId: 0 // Using 0 to indicate removal, adjust based on your API
      }).subscribe({
        next: () => {
          group.students = group.students.filter((s: User) => s.id !== studentId);
        },
        error: (err) => {
          console.error('Failed to remove student from group', err);
          alert('Не удалось удалить студента из группы');
        }
      });
    }
  }
}