import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
// import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Public } from 'src/public.decorator';
import { CurrentUser } from 'src/current-user.decorator';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    // private authService: AuthService,
  ) {}

  @Public()
  @Post('/signup')
  async create(@Body() createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto);
  }

  @Public()
  @Post('/login')
  async login(@Body() dto: UserLoginDto) {
    const { email, password } = dto;
    return await this.usersService.login(email, password);
  }

  @Get('/me')
  async getUserInfo(@CurrentUser('userId') userId: string) {
    return this.usersService.getUserInfo(userId);
  }

  @Patch('/me')
  update(
    @CurrentUser('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('me')
  remove(@CurrentUser('userId') userId: string) {
    return this.usersService.remove(userId);
  }
}
