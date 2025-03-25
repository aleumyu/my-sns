import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService],
  imports: [PrismaModule],
  exports: [TicketsService],
})
export class TicketsModule {}
