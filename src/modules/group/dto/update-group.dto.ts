export class UpdateGroupDto {
  name?: string;
  courseId?: number;
  branchId?: number;
  roomId?: number;
  startLesson?: string;
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
