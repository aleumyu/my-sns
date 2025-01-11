import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
// import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(CreateUserDto: CreateUserDto) {
    const userExists = await this.checkUserExists(CreateUserDto.email);
    if (userExists) {
      throw new HttpException('user_already_exist', HttpStatus.CONFLICT);
    }

    await this.saveUser(CreateUserDto);
  }

  private async checkUserExists(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  private async saveUser(CreateUserDto: CreateUserDto) {
    return await this.prisma.user.create({ data: CreateUserDto });
  }

  async login(email: string) {
    const user = await this.checkUserExists(email);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return this.authService.login({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }
  findAll() {
    return `This action returns all user`;
  }

  async getUserInfo(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
