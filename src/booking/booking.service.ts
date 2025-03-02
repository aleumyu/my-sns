import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { TicketsService } from 'src/tickets/tickets.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class BookingService {
  constructor(
    private ticketsService: TicketsService,
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}
  async create(profileId, createBookingDto: CreateBookingDto) {
    const { ticketIds, paymentInfo } = createBookingDto;

    try {
      //1. lock tickets in redis
      const lockResults = await Promise.all(
        ticketIds.map((ticketId) => {
          const result = this.redisService.lockTicket(ticketId, profileId);
          return { ticketId: ticketId, result: result };
        }),
      );
      const failedLockTickets = lockResults.filter(
        (lockResult) => !lockResult.result,
      );

      //2. if failed to lock tickets, release all locked tickets and throw error
      if (failedLockTickets.length > 0) {
        await Promise.all(
          failedLockTickets.map((ticket) =>
            this.redisService.unlockTicket(ticket.ticketId, profileId),
          ),
        );
        throw new Error('Failed to lock tickets');
      }

      // 3. change ticket status to pending
      await this.ticketsService.updateStatus(ticketIds, 'PENDING');

      //4. connect and send payment info to payment provider like stripe
      const paymentResult = await fakePaymentService(paymentInfo);

      // 5-1. if payment success, change ticket status to sold, Create booking record, and release lock
      if (paymentResult) {
        const result = await this.prisma.$transaction([
          this.prisma.ticket.updateMany({
            where: { id: { in: ticketIds } },
            data: { status: 'SOLD' },
          }),
          this.prisma.booking.create({
            data: {
              buyerId: profileId,
              paymentInfo,
              tickets: { connect: ticketIds.map((id) => ({ id })) },
            },
          }),
        ]);
        await Promise.all(
          ticketIds.map((ticketId) =>
            this.redisService.unlockTicket(ticketId, profileId),
          ),
        );
        return {
          status: 'success',
          result,
        };
      } else {
        // 5-2. if payment failed, change ticket status to available and release lock
        await this.ticketsService.updateStatus(ticketIds, 'AVAILABLE');
        // we  don't create booking record as payment failed.
        // QUESTION: maybe it would be better to create a booking record with status failed (status column in booking table)
        await Promise.all(
          ticketIds.map((ticketId) =>
            this.redisService.unlockTicket(ticketId, profileId),
          ),
        );
        return {
          status: 'failed',
        };
      }
    } catch (error) {
      console.log(error);
      throw new Error('Booking failed');
    }
  }

  findAll() {
    return `This action returns all booking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  // update(id: number, updateBookingDto: UpdateBookingDto) {
  //   return `This action updates a #${id} booking`;
  // }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}

async function fakePaymentService(paymentInfo: any) {
  console.log('paymentInfo', paymentInfo);
  return true;
}
