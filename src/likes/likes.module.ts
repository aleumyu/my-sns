import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
