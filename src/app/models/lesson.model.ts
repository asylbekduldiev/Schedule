export interface Lesson {
  id: number;
  subject: string;
  teacher: string;
  room: string;
  groupName: string;
  startTime: string;
  endTime: string;
  status?: string;
  createdBy?: string;
  lastModifiedBy?: string;
}