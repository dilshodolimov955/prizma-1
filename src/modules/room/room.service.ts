import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    return await this.prisma.room.create({
      data: createRoomDto,
      include: { branch: true, groups: true },
    });
  }

  async findAll(take = 10, skip = 0) {
    return await this.prisma.room.findMany({
      take,
      skip,
      include: { branch: true, groups: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { branch: true, groups: true },
    });
    if (!room) {
      throw new NotFoundException(`Room #${id} topilmadi`);
    }
    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    try {
      const data: any = {};
      if (updateRoomDto.name !== undefined) data.name = updateRoomDto.name;
      if (updateRoomDto.capacity !== undefined) data.capacity = updateRoomDto.capacity;
      if (updateRoomDto.branchId !== undefined) data.branchId = updateRoomDto.branchId;
      if (updateRoomDto.status !== undefined) data.status = updateRoomDto.status;

      return await this.prisma.room.update({
        where: { id },
        data,
        include: { branch: true, groups: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room #${id} topilmadi`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.room.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room #${id} topilmadi`);
      }
      throw error;
    }
  }
}
