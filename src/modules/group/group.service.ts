import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    return await this.prisma.group.create({
      data: createGroupDto,
      include: {
        course: true,
        room: true,
        branch: true,
        teacherGroups: true,
        studentGroups: true,
      },
    });
  }

  async findAll(take = 10, skip = 0) {
    return await this.prisma.group.findMany({
      take,
      skip,
      include: {
        course: true,
        room: true,
        branch: true,
        teacherGroups: true,
        studentGroups: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        course: true,
        room: true,
        branch: true,
        teacherGroups: true,
        studentGroups: true,
      },
    });
    if (!group) {
      throw new NotFoundException(`Group #${id} topilmadi`);
    }
    return group;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    try {
      const data: any = {};
      if (updateGroupDto.name !== undefined) data.name = updateGroupDto.name;
      if (updateGroupDto.courseId !== undefined) data.courseId = updateGroupDto.courseId;
      if (updateGroupDto.branchId !== undefined) data.branchId = updateGroupDto.branchId;
      if (updateGroupDto.roomId !== undefined) data.roomId = updateGroupDto.roomId;
      if (updateGroupDto.startLesson !== undefined) data.startLesson = updateGroupDto.startLesson;
      if (updateGroupDto.startDate !== undefined) data.startDate = updateGroupDto.startDate;
      if (updateGroupDto.endDate !== undefined) data.endDate = updateGroupDto.endDate;
      if (updateGroupDto.status !== undefined) data.status = updateGroupDto.status;

      return await this.prisma.group.update({
        where: { id },
        data,
        include: {
          course: true,
          room: true,
          branch: true,
          teacherGroups: true,
          studentGroups: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Group #${id} topilmadi`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.group.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Group #${id} topilmadi`);
      }
      throw error;
    }
  }
}
