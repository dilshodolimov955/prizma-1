export class UpdateStudentGroupDto {
  studentId?: number;
  groupId?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
