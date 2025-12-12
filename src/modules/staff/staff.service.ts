import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(createStaffDto: CreateStaffDto) {
    return await this.prisma.staff.create({
      data: createStaffDto,
      include: { branch: true },
    });
  }

  async findAll(take = 10, skip = 0) {
    return await this.prisma.staff.findMany({
      take,
      skip,
      include: { branch: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: { branch: true },
    });
    if (!staff) {
      throw new NotFoundException(`Staff #${id} topilmadi`);
    }
    return staff;
  }

  async update(id: number, updateStaffDto: UpdateStaffDto) {
    try {
      const data: any = {};
      if (updateStaffDto.fullName !== undefined) data.fullName = updateStaffDto.fullName;
      if (updateStaffDto.email !== undefined) data.email = updateStaffDto.email;
      if (updateStaffDto.phone !== undefined) data.phone = updateStaffDto.phone;
      if (updateStaffDto.password !== undefined) data.password = updateStaffDto.password;
      if (updateStaffDto.branchId !== undefined) data.branchId = updateStaffDto.branchId;
      if (updateStaffDto.role !== undefined) data.role = updateStaffDto.role;
      if (updateStaffDto.photo !== undefined) data.photo = updateStaffDto.photo;
      if (updateStaffDto.status !== undefined) data.status = updateStaffDto.status;

      return await this.prisma.staff.update({
        where: { id },
        data,
        include: { branch: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Staff #${id} topilmadi`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.staff.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Staff #${id} topilmadi`);
      }
      throw error;
    }
  }
}
