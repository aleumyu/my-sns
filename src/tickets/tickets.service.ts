import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status } from '@prisma/client';
@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}
  async create(createTicketDto: CreateTicketDto[], eventId: string) {
    const ticket = await this.prisma.ticket.createMany({
      data: createTicketDto.map((ticket) => {
        return {
          status: 'AVAILABLE',
          price: ticket.price,
          seat: ticket.seat,
          eventId,
        };
      }),
    });
    return ticket;
  }

  findAll() {
    return `This action returns all tickets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ticket`;
  }

  async updateStatus(ticketIds: string[], status: Status) {
    const tickets = await this.prisma.ticket.updateMany({
      where: { id: { in: ticketIds } },
      data: { status },
    });
    return tickets;
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
