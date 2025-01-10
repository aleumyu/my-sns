import * as uuid from 'uuid';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
// import { EmailService } from 'src/email/email.service';

@Injectable()
export class UsersService {
  // constructor(private emailService: EmailService) {}
  constructor() {}

  async create(name: string, email: string, password: string) {
    await this.checkUserExists(email);

    const token = uuid.v1();

    await this.saveUser(name, email, password, token);
    // await this.sendMemberJoinEmail(email, token);
  }

  //TODO after setup DB
  private checkUserExists(email: string) {
    return false;
  }

  //TODO after setup DB
  private saveUser(
    name: string,
    email: string,
    password: string,
    token: string,
  ) {
    return false;
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
