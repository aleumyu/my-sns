import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserLoginDto } from './dto/user-login.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    await this.usersService.create(name, email, password);
  }

  @Post('/verify')
  async verifyEmail(@Query() dto: VerifyEmailDto) {
    const { singupVerifyToken } = dto;
    console.log(singupVerifyToken);
    return await this.usersService.verifyEmail(singupVerifyToken);
  }

  @Post('/login')
  async login(@Body() dto: UserLoginDto) {
    const { email, password } = dto;
    return await this.usersService.login(email, password);
  }
  @Get('/:id')
  async getUserInfo(@Param('id', ParseIntPipe) id: string) {
    return this.usersService.getUserInfo(+id);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
