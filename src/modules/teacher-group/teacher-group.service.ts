import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherGroupDto } from './dto/create-teacher-group.dto';
import { UpdateTeacherGroupDto } from './dto/update-teacher-group.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeacherGroupService {
  constructor(private prisma: PrismaService) {}

  async create(createTeacherGroupDto: CreateTeacherGroupDto) {
    return await this.prisma.teacherGroup.create({
      data: createTeacherGroupDto,
      include: {
        teacher: true,
        group: true,
        branch: true,
      },
    });
  }

  async findAll(take = 10, skip = 0) {
    return await this.prisma.teacherGroup.findMany({
      take,
      skip,
      include: {
        teacher: true,
        group: true,
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const teacherGroup = await this.prisma.teacherGroup.findUnique({
      where: { id },
      include: {
        teacher: true,
        group: true,
        branch: true,
      },
    });
    if (!teacherGroup) {
      throw new NotFoundException(`TeacherGroup #${id} topilmadi`);
    }
    return teacherGroup;
  }

  async update(id: number, updateTeacherGroupDto: UpdateTeacherGroupDto) {
    try {
      const data: any = {};
      if (updateTeacherGroupDto.teacherId !== undefined) data.teacherId = updateTeacherGroupDto.teacherId;
      if (updateTeacherGroupDto.groupId !== undefined) data.groupId = updateTeacherGroupDto.groupId;
      if (updateTeacherGroupDto.status !== undefined) data.status = updateTeacherGroupDto.status;

      return await this.prisma.teacherGroup.update({
        where: { id },
        data,
        include: {
          teacher: true,
          group: true,
          branch: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`TeacherGroup #${id} topilmadi`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.teacherGroup.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`TeacherGroup #${id} topilmadi`);
      }
      throw error;
    }
  }
}
