import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  // CREATE - Yangi teacher qo'shish
  async create(createTeacherDto: CreateTeacherDto) {
    try {
      const teacher = await this.prisma.teacher.create({
        data: {
          fullName: createTeacherDto.fullName,
          email: createTeacherDto.email,
          phone: createTeacherDto.phone,
          password: createTeacherDto.password,
          branchId: createTeacherDto.branchId,
          photo: createTeacherDto.photo || null,
        },
        include: {
          branch: true,
          teacherGroups: true,
        },
      });
      return teacher;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email yoki telefon raqam allaqachon mavjud');
      }
      throw error;
    }
  }

  // READ ALL - Barcha teacherlarni olish
  async findAll(take = 10, skip = 0) {
    const teachers = await this.prisma.teacher.findMany({
      take,
      skip,
      include: {
        branch: true,
        teacherGroups: {
          include: {
            group: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return teachers;
  }

  // READ ONE - Bitta teacher olish
  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        branch: true,
        teacherGroups: {
          include: {
            group: {
              include: {
                course: true,
                room: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher #${id} topilmadi`);
    }
    return teacher;
  }

  // SEARCH - Teacher qidirish
  async search(query: string) {
    return this.prisma.teacher.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
        ],
      },
      include: {
        branch: true,
        teacherGroups: true,
      },
    });
  }

  // UPDATE - Teacher tahrirlash
  async update(id: number, updateTeacherDto: UpdateTeacherDto) {
    try {
      const data: any = {};
      if (updateTeacherDto.fullName !== undefined) data.fullName = updateTeacherDto.fullName;
      if (updateTeacherDto.email !== undefined) data.email = updateTeacherDto.email;
      if (updateTeacherDto.phone !== undefined) data.phone = updateTeacherDto.phone;
      if (updateTeacherDto.password !== undefined) data.password = updateTeacherDto.password;
      if (updateTeacherDto.photo !== undefined) data.photo = updateTeacherDto.photo;
      if (updateTeacherDto.status !== undefined) data.status = updateTeacherDto.status;

      const teacher = await this.prisma.teacher.update({
        where: { id },
        data,
        include: {
          branch: true,
          teacherGroups: true,
        },
      });
      return teacher;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Teacher #${id} topilmadi`);
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Email yoki telefon raqam allaqachon mavjud');
      }
      throw error;
    }
  }

  // DELETE - Teacher o'chirish
  async remove(id: number) {
    try {
      // Avval teacherGroups larni o'chirish
      await this.prisma.teacherGroup.deleteMany({
        where: { teacherId: id },
      });

      // Keyin teacher ni o'chirish
      const teacher = await this.prisma.teacher.delete({
        where: { id },
      });
      return teacher;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Teacher #${id} topilmadi`);
      }
      throw error;
    }
  }

  // Teacher fotoini yangilash
  async updatePhoto(id: number, photoUrl: string) {
    return this.prisma.teacher.update({
      where: { id },
      data: { photo: photoUrl },
      include: {
        branch: true,
      },
    });
  }

  // Teacher statusini yangilash
  async updateStatus(id: number, status: string) {
    return this.prisma.teacher.update({
      where: { id },
      data: { status: status as any },
      include: {
        branch: true,
      },
    });
  }

  // Teacher va Group bog'lash
  async assignToGroup(teacherId: number, groupId: number, branchId: number) {
    return this.prisma.teacherGroup.create({
      data: {
        teacherId,
        groupId,
        branchId,
      },
      include: {
        teacher: true,
        group: true,
        branch: true,
      },
    });
  }

  // Teacher va Group ni ajratish
  async removeFromGroup(teacherId: number, groupId: number) {
    return this.prisma.teacherGroup.deleteMany({
      where: {
        teacherId,
        groupId,
      },
    });
  }
}
