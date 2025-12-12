export class UpdateTeacherGroupDto {
  teacherId?: number;
  groupId?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
