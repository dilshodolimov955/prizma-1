export class UpdateStudentDto {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  photo?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
