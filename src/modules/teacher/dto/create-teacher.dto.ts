export class CreateTeacherDto {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  branchId: number;
  photo?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
