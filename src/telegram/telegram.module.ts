import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [TelegramService, PrismaService],
  exports: [TelegramService],
})
export class TelegramModule {}
