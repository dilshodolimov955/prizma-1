import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ModulesModule } from './modules/modules.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [ModulesModule, TelegramModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
