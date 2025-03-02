import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TicketsModule } from 'src/tickets/tickets.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [PrismaModule, TicketsModule],
})
export class BookingModule {}
