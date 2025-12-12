import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto) {
    return await this.prisma.course.create({
      data: createCourseDto,
      include: { branch: true, groups: true },
    });
  }

  async findAll(take = 10, skip = 0) {
    return await this.prisma.course.findMany({
      take,
      skip,
      include: { branch: true, groups: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { branch: true, groups: true },
    });
    if (!course) {
      throw new NotFoundException(`Course #${id} topilmadi`);
    }
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    try {
      const data: any = {};
      if (updateCourseDto.name !== undefined) data.name = updateCourseDto.name;
      if (updateCourseDto.price !== undefined) data.price = updateCourseDto.price;
      if (updateCourseDto.durationMonth !== undefined) data.durationMonth = updateCourseDto.durationMonth;
      if (updateCourseDto.durationHours !== undefined) data.durationHours = updateCourseDto.durationHours;
      if (updateCourseDto.level !== undefined) data.level = updateCourseDto.level;
      if (updateCourseDto.branchId !== undefined) data.branchId = updateCourseDto.branchId;
      if (updateCourseDto.status !== undefined) data.status = updateCourseDto.status;

      return await this.prisma.course.update({
        where: { id },
        data,
        include: { branch: true, groups: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Course #${id} topilmadi`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.course.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Course #${id} topilmadi`);
      }
      throw error;
    }
  }
}
