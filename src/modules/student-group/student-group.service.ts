import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentGroupDto } from './dto/create-student-group.dto';
import { UpdateStudentGroupDto } from './dto/update-student-group.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudentGroupService {
  constructor(private prisma: PrismaService) {}

  async create(createStudentGroupDto: CreateStudentGroupDto) {
    return await this.prisma.studentGroup.create({
      data: createStudentGroupDto,
      include: {
        student: true,
        group: true,
        branch: true,
      },
    });
  }

  async findAll(take = 10, skip = 0) {
    return await this.prisma.studentGroup.findMany({
      take,
      skip,
      include: {
        student: true,
        group: true,
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const studentGroup = await this.prisma.studentGroup.findUnique({
      where: { id },
      include: {
        student: true,
        group: true,
        branch: true,
      },
    });
    if (!studentGroup) {
      throw new NotFoundException(`StudentGroup #${id} topilmadi`);
    }
    return studentGroup;
  }

  async update(id: number, updateStudentGroupDto: UpdateStudentGroupDto) {
    try {
      const data: any = {};
      if (updateStudentGroupDto.studentId !== undefined) data.studentId = updateStudentGroupDto.studentId;
      if (updateStudentGroupDto.groupId !== undefined) data.groupId = updateStudentGroupDto.groupId;
      if (updateStudentGroupDto.status !== undefined) data.status = updateStudentGroupDto.status;

      return await this.prisma.studentGroup.update({
        where: { id },
        data,
        include: {
          student: true,
          group: true,
          branch: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`StudentGroup #${id} topilmadi`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.studentGroup.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`StudentGroup #${id} topilmadi`);
      }
      throw error;
    }
  }
}
