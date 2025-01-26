import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}
  async create(userId: string) {
    const profileExists = await this.checkProfileExists(userId);
    if (profileExists) {
      throw new HttpException('profile_already_exist', HttpStatus.CONFLICT);
    }
    return await this.prisma.profile.create({
      data: { userId, createdAt: new Date() },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });
    if (!profile) {
      throw new NotFoundException('profile does not exist');
    }
    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
    };
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({ where: { id } });
    if (!profile) {
      throw new HttpException(
        'Profile does not exist',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.prisma.profile.update({
      where: { id },
      data: { name: updateProfileDto.name },
    });
  }

  remove(id: string) {
    return `This action removes a #${id} profile`;
  }

  private async checkProfileExists(userId: string) {
    return await this.prisma.profile.findUnique({ where: { userId } });
  }
}
