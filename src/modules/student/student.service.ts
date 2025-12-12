import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  // CREATE - Yangi student qo'shish
  async create(createStudentDto: CreateStudentDto) {
    try {
      const student = await this.prisma.student.create({
        data: {
          fullName: createStudentDto.fullName,
          email: createStudentDto.email,
          phone: createStudentDto.phone,
          password: createStudentDto.password,
          branchId: createStudentDto.branchId,
          photo: createStudentDto.photo || null,
        },
        include: {
          branch: true,
          studentGroups: true,
        },
      });
      return student;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email yoki telefon raqam allaqachon mavjud');
      }
      throw error;
    }
  }

  // READ ALL - Barcha studentlarni olish
  async findAll(take = 10, skip = 0) {
    const students = await this.prisma.student.findMany({
      take,
      skip,
      include: {
        branch: true,
        studentGroups: {
          include: {
            group: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return students;
  }

  // READ ONE - Bitta student olish
  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        branch: true,
        studentGroups: {
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

    if (!student) {
      throw new NotFoundException(`Student #${id} topilmadi`);
    }
    return student;
  }

  // SEARCH - Student qidirish
  async search(query: string) {
    return this.prisma.student.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
        ],
      },
      include: {
        branch: true,
        studentGroups: true,
      },
    });
  }

  // UPDATE - Student tahrirlash
  async update(id: number, updateStudentDto: UpdateStudentDto) {
    try {
      const data: any = {};
      if (updateStudentDto.fullName !== undefined) data.fullName = updateStudentDto.fullName;
      if (updateStudentDto.email !== undefined) data.email = updateStudentDto.email;
      if (updateStudentDto.phone !== undefined) data.phone = updateStudentDto.phone;
      if (updateStudentDto.password !== undefined) data.password = updateStudentDto.password;
      if (updateStudentDto.photo !== undefined) data.photo = updateStudentDto.photo;
      if (updateStudentDto.status !== undefined) data.status = updateStudentDto.status;

      const student = await this.prisma.student.update({
        where: { id },
        data,
        include: {
          branch: true,
          studentGroups: true,
        },
      });
      return student;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Student #${id} topilmadi`);
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Email yoki telefon raqam allaqachon mavjud');
      }
      throw error;
    }
  }

  // DELETE - Student o'chirish
  async remove(id: number) {
    try {
      // Avval studentGroups larni o'chirish
      await this.prisma.studentGroup.deleteMany({
        where: { studentId: id },
      });

      // Keyin student ni o'chirish
      const student = await this.prisma.student.delete({
        where: { id },
      });
      return student;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Student #${id} topilmadi`);
      }
      throw error;
    }
  }

  // Student fotoini yangilash
  async updatePhoto(id: number, photoUrl: string) {
    return this.prisma.student.update({
      where: { id },
      data: { photo: photoUrl },
      include: {
        branch: true,
      },
    });
  }

  // Student statusini yangilash
  async updateStatus(id: number, status: string) {
    return this.prisma.student.update({
      where: { id },
      data: { status: status as any },
      include: {
        branch: true,
      },
    });
  }

  // Student va Group bog'lash
  async assignToGroup(studentId: number, groupId: number, branchId: number) {
    return this.prisma.studentGroup.create({
      data: {
        studentId,
        groupId,
        branchId,
      },
      include: {
        student: true,
        group: true,
        branch: true,
      },
    });
  }

  // Student va Group ni ajratish
  async removeFromGroup(studentId: number, groupId: number) {
    return this.prisma.studentGroup.deleteMany({
      where: {
        studentId,
        groupId,
      },
    });
  }
}
