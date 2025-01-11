import * as uuid from 'uuid';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
// import { EmailService } from 'src/email/email.service';

@Injectable()
export class UsersService {
  // constructor(private emailService: EmailService) {}
  constructor(private prisma: PrismaService) {}

  async create(CreateUserDto: CreateUserDto) {
    await this.checkUserExists(CreateUserDto.email);

    // const token = uuid.v1();

    await this.saveUser(CreateUserDto);
    // await this.sendMemberJoinEmail(email, token);
  }

  private async checkUserExists(email: string) {
    return await this.prisma.user.findFirst({ where: { email } });
  }

  //TODO after setup DB
  private async saveUser(
    CreateUserDto: CreateUserDto,
    // token: string,
  ) {
    const userExists = await this.checkUserExists(CreateUserDto.email);
    if (userExists) {
      throw new HttpException('user_already_exist', HttpStatus.CONFLICT);
    }
    return await this.prisma.user.create({ data: CreateUserDto });
  }

  //TODO after setup DB
  // private async sendMemberJoinEmail(email: string, token: string) {
  //   await this.emailService.sendMemberJoinVerification(email, token);
  // }

  async verifyEmail(token: string) {
    //TODO after set up db
    console.log(token);
    throw new Error('not implemented');
  }

  async login(email: string, password: string) {
    //TODO
    // check existancee of user with email and passwordin db
    //if not exist, throw an error
    // if exist, crate JWT
    throw new Error('Not implemented');
  }

  findAll() {
    return `This action returns all user`;
  }

  getUserInfo(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
