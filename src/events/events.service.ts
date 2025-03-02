import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from '../prisma/prisma.service';
import SearchService from '../search/search.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';

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

  // update(id: number, updateEventDto: UpdateEventDto) {
  //   return `This action updates a #${id} event`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} event`;
  // }

  async search(
    keyword?: string,
    venue?: string,
    start?: string,
    end?: string,
    pageSize?: number,
    page?: number,
  ) {
    const where = {
      AND: [] as any[],
    };
    // QUESTION: is this right way to do search?
    // elasticsearch for keyword search and the rest of the query params are for prisma?
    // or should I use elasticsearch for all query params + pagination?
    if (keyword) {
      const results = await this.searchService.search(keyword, 'events');
      where.AND.push({
        id: { in: results.map((result: any) => result.id) },
      });
      // where.AND.push({
      //   OR: [
      //     { title: { contains: keyword, mode: 'insensitive' } },
      //     { description: { contains: keyword, mode: 'insensitive' } },
      //   ],
      // });
    }

    if (venue) {
      where.AND.push({
        venue: { contains: venue, mode: 'insensitive' },
      });
    }

    if (start) {
      where.AND.push({
        start: { gte: start },
      });
    }

    if (end) {
      where.AND.push({
        end: { lte: end },
      });
    }

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          start: 'asc',
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
