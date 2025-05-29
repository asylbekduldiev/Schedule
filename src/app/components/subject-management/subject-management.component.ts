import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
// import { Subject } from "rxjs";
import { Subject } from "../../models/subject.model"; // Adjust the path as needed to your Subject model
import { SubjectService } from "./subject.service"; // Adjust the path as needed to your SubjectService
@Component({
  standalone: true,
  selector: 'app-subject-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './subject-management.component.html',
  providers: [SubjectService], // Add this line if SubjectService is not providedIn: 'root'
})

export class SubjectManagementComponent implements OnInit {
  subjects: Subject[] = [];
  newSubject: Partial<Subject> = { name: '', color: '', icon: '', description: '' };

  constructor(private subjectService: SubjectService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.subjectService.getAll().subscribe(res => (this.subjects = res));
  }

  add() {
    this.subjectService.create(this.newSubject).subscribe(() => {
      this.newSubject = { name: '', color: '', icon: '', description: '' };
      this.load();
    });
  }

  remove(id: number) {
    this.subjectService.delete(id).subscribe(() => this.load());
  }
}