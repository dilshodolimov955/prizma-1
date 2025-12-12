import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {
    try {
      return await this.prisma.branch.create({
        data: createBranchDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Bu nomi bilan branch allaqachon mavjud');
      }
      throw error;
    }
  }

  async findAll(take = 10, skip = 0) {
    return await this.prisma.branch.findMany({
      take,
      skip,
      include: {
        rooms: true,
        courses: true,
        groups: true,
        teachers: true,
        students: true,
        staffs: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        rooms: true,
        courses: true,
        groups: true,
        teachers: true,
        students: true,
        staffs: true,
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch #${id} topilmadi`);
    }
    return branch;
  }

  async update(id: number, updateBranchDto: UpdateBranchDto) {
    try {
      const data: any = {};
      if (updateBranchDto.name !== undefined) data.name = updateBranchDto.name;
      if (updateBranchDto.logoUrl !== undefined) data.logoUrl = updateBranchDto.logoUrl;
      if (updateBranchDto.address !== undefined) data.address = updateBranchDto.address;
      if (updateBranchDto.status !== undefined) data.status = updateBranchDto.status;

      return await this.prisma.branch.update({
        where: { id },
        data,
        include: {
          rooms: true,
          courses: true,
          groups: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Branch #${id} topilmadi`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.branch.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Branch #${id} topilmadi`);
      }
      throw error;
    }
  }
}
