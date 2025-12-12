import { Module } from '@nestjs/common';
import { BranchModule } from './branch/branch.module';
import { CourseModule } from './course/course.module';
import { GroupModule } from './group/group.module';
import { RoomModule } from './room/room.module';
import { StaffModule } from './staff/staff.module';
import { StudentModule } from './student/student.module';
import { StudentGroupModule } from './student-group/student-group.module';
import { TeacherModule } from './teacher/teacher.module';
import { TeacherGroupModule } from './teacher-group/teacher-group.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    BranchModule,
    CourseModule,
    GroupModule,
    RoomModule,
    StaffModule,
    StudentModule,
    StudentGroupModule,
    TeacherModule,
    TeacherGroupModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class ModulesModule {}
