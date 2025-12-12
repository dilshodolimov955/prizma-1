import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Multer konfiguratsiyasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'teachers');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Faqat rasm fayllar qabul qilinadi'), false);
  }
};

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // CREATE - Yangi teacher qo'shish
  @Post()
  async create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  // CREATE WITH PHOTO - Fotosu bilan teacher qo'shish
  @Post('with-photo')
  @UseInterceptors(FileInterceptor('photo', { storage, fileFilter }))
  async createWithPhoto(
    @Body() createTeacherDto: CreateTeacherDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createTeacherDto.photo = `/uploads/teachers/${file.filename}`;
    }
    return this.teacherService.create(createTeacherDto);
  }

  // READ ALL - Barcha teacherlarni olish
  @Get()
  async findAll(
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    return this.teacherService.findAll(take || 10, skip || 0);
  }

  // SEARCH - Teacher qidirish
  @Get('search/:query')
  async search(@Param('query') query: string) {
    return this.teacherService.search(query);
  }

  // READ ONE - Bitta teacher olish
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.findOne(id);
  }

  // UPDATE - Teacher tahrirlash
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teacherService.update(id, updateTeacherDto);
  }

  // UPDATE WITH PHOTO - Fotosu bilan tahrirlash
  @Patch(':id/photo')
  @UseInterceptors(FileInterceptor('photo', { storage, fileFilter }))
  async updateWithPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Rasm fayli talab qilinadi');
    }
    const photoUrl = `/uploads/teachers/${file.filename}`;
    return this.teacherService.updatePhoto(id, photoUrl);
  }

  // UPDATE STATUS - Teacher statusini yangilash
  @Patch(':id/status/:status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('status') status: string,
  ) {
    return this.teacherService.updateStatus(id, status);
  }

  // DELETE - Teacher o'chirish
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.remove(id);
  }

  // ASSIGN TO GROUP - Teacher ni guruhga biriktirish
  @Post(':teacherId/assign-group/:groupId/:branchId')
  async assignToGroup(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('branchId', ParseIntPipe) branchId: number,
  ) {
    return this.teacherService.assignToGroup(teacherId, groupId, branchId);
  }

  // REMOVE FROM GROUP - Teacher ni guruhdan ajratish
  @Delete(':teacherId/remove-group/:groupId')
  async removeFromGroup(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.teacherService.removeFromGroup(teacherId, groupId);
  }
}
