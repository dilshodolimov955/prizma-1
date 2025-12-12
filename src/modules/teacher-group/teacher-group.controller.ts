import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TeacherGroupService } from './teacher-group.service';
import { CreateTeacherGroupDto } from './dto/create-teacher-group.dto';
import { UpdateTeacherGroupDto } from './dto/update-teacher-group.dto';

@Controller('teacher-groups')
export class TeacherGroupController {
  constructor(private readonly teacherGroupService: TeacherGroupService) {}

  @Post()
  create(@Body() createTeacherGroupDto: CreateTeacherGroupDto) {
    return this.teacherGroupService.create(createTeacherGroupDto);
  }

  @Get()
  findAll(
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    return this.teacherGroupService.findAll(take || 10, skip || 0);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherGroupService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherGroupDto: UpdateTeacherGroupDto,
  ) {
    return this.teacherGroupService.update(id, updateTeacherGroupDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teacherGroupService.remove(id);
  }
}
