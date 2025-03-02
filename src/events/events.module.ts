import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TicketsModule } from 'src/tickets/tickets.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SearchModule } from 'src/search/search.module';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, KafkaProducerService],
  imports: [PrismaModule, TicketsModule, SearchModule],
  exports: [EventsService],
})
export class EventsModule {}
