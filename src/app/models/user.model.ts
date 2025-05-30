export interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  name: string;
  groupName?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}