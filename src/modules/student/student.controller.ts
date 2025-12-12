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
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Multer konfiguratsiyasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'students');
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

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // CREATE - Yangi student qo'shish
  @Post()
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  // CREATE WITH PHOTO - Fotosu bilan student qo'shish
  @Post('with-photo')
  @UseInterceptors(FileInterceptor('photo', { storage, fileFilter }))
  async createWithPhoto(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createStudentDto.photo = `/uploads/students/${file.filename}`;
    }
    return this.studentService.create(createStudentDto);
  }

  // READ ALL - Barcha studentlarni olish
  @Get()
  async findAll(
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    return this.studentService.findAll(take || 10, skip || 0);
  }

  // SEARCH - Student qidirish
  @Get('search/:query')
  async search(@Param('query') query: string) {
    return this.studentService.search(query);
  }

  // READ ONE - Bitta student olish
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  // UPDATE - Student tahrirlash
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, updateStudentDto);
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
    const photoUrl = `/uploads/students/${file.filename}`;
    return this.studentService.updatePhoto(id, photoUrl);
  }

  // UPDATE STATUS - Student statusini yangilash
  @Patch(':id/status/:status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('status') status: string,
  ) {
    return this.studentService.updateStatus(id, status);
  }

  // DELETE - Student o'chirish
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.remove(id);
  }

  // ASSIGN TO GROUP - Student ni guruhga biriktirish
  @Post(':studentId/assign-group/:groupId/:branchId')
  async assignToGroup(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('branchId', ParseIntPipe) branchId: number,
  ) {
    return this.studentService.assignToGroup(studentId, groupId, branchId);
  }

  // REMOVE FROM GROUP - Student ni guruhdan ajratish
  @Delete(':studentId/remove-group/:groupId')
  async removeFromGroup(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.studentService.removeFromGroup(studentId, groupId);
  }
}
