export class CreateStaffDto {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: 'ADMIN' | 'MANAGER' | 'RECEPTIONIST';
  branchId: number;
  photo?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
