export class UpdateStaffDto {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  branchId?: number;
  role?: 'ADMIN' | 'MANAGER' | 'RECEPTIONIST';
  photo?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
