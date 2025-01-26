import { compare, hash } from 'bcrypt';

import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { ProfilesService } from 'src/profiles/profiles.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private ProfilesService: ProfilesService,
  ) {}

  async create(CreateUserDto: CreateUserDto) {
    const userExists = await this.checkUserExists(CreateUserDto.email);
    if (userExists) {
      throw new HttpException('user_already_exist', HttpStatus.CONFLICT);
    }
    // Qustion: How to handle prisma argument?
    return this.prisma.$transaction(async (prisma) => {
      const user = await this.saveUser(CreateUserDto);
      await this.ProfilesService.create(user.id);
    });
  }

  private async checkUserExists(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  private async saveUser(CreateUserDto: CreateUserDto) {
    return await this.prisma.user.create({
      data: {
        ...CreateUserDto,
        password: await hash(CreateUserDto.password, 10),
      },
    });
  }

  async login(email: string, password: string) {
    const user = await this.checkUserExists(email);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const samePassword = await compare(password, user.password);
    if (!samePassword) {
      throw new HttpException('invalid_credentials', HttpStatus.UNAUTHORIZED);
    }

    const profile = await this.ProfilesService.findOne(user.id);

    return this.authService.login({
      userId: user.id,
      email: user.email,
      profileId: profile.id,
    });
  }

  // findAll() {
  //   return `This action returns all user`;
  // }

  async getUserInfo(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return {
      id: user.id,
      email: user.email,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.UNAUTHORIZED);
    }
    const samePassword = await compare(updateUserDto.password, user.password);
    if (!samePassword) {
      throw new HttpException('invalid_credentials', HttpStatus.UNAUTHORIZED);
    }

    return await this.prisma.user.update({
      where: { id },
      data: { password: await hash(updateUserDto.newPassword, 10) },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.UNAUTHORIZED);
    }
    return await this.prisma.user.delete({ where: { id } });
  }
}
