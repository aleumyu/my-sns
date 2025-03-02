import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TicketsModule } from 'src/tickets/tickets.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SearchModule } from 'src/search/search.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [PrismaModule, TicketsModule, SearchModule],
  exports: [EventsService],
})
export class EventsModule {}
