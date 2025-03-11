import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from '../prisma/prisma.service';
import SearchService, { PaginatedResponse } from '../search/search.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';

export type SearchParams = {
  keyword?: string;
  venue?: string;
  start?: string;
  end?: string;
};

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private kafkaProducerService: KafkaProducerService,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
      },
    });

    this.kafkaProducerService.emitCreateEventEsEvent(event);

    return event;
  }

  findAll() {
    return `This action returns all events`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  async search(
    search: SearchParams,
    pageSize?: number,
    page?: number,
  ): Promise<PaginatedResponse[]> {
    // QUESTION: is this right way to do search?
    // elasticsearch for keyword search and the rest of the query params are for prisma?
    // or should I use elasticsearch for all query params + pagination?
    if (search) {
      const results = await this.searchService.search({
        search,
        index: 'events',
        page,
        pageSize,
      });
      if (Array.isArray(results)) {
        return results;
      }
      return results.items;
    }

    const results = await this.prisma.event.findMany({
      orderBy: {
        start: 'asc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return results;
  }
}
