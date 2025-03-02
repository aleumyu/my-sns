import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  create(profileId, createBookingDto: CreateBookingDto) {
    // change ticket status
    // connect and send payment info to payment provider like stripe
    const result = 'success';

    if (result === 'success') {
      // ticket status to sold
      // save booking, status with succss
      // return success
    } else {
      // ticket status to available
      // save booking status with fail
      // return fail
    }
  }

  findAll() {
    return `This action returns all booking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
