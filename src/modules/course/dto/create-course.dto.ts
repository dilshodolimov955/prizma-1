export class CreateCourseDto {
  name: string;
  price: number;
  durationMonth: number;
  durationHours: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  branchId: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
