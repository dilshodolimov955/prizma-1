export class CreateTeacherGroupDto {
  teacherId: number;
  groupId: number;
  branchId: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
