export class CreateStudentGroupDto {
  studentId: number;
  groupId: number;
  branchId: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
