import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthService } from 'src/auth/auth.service';
import { ProfilesService } from 'src/profiles/profiles.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuthService, ProfilesService],
  imports: [PrismaModule],
})
export class UsersModule {}
