import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TicketsService } from 'src/tickets/tickets.service';
import { RedisService } from 'src/redis/redis.service';
@Module({
  controllers: [BookingController],
  providers: [BookingService, TicketsService, RedisService],
  imports: [PrismaModule],
})
export class BookingModule {}
