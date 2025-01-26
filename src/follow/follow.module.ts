import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProfilesModule } from 'src/profiles/profiles.module';

@Module({
  controllers: [FollowController],
  providers: [FollowService],
  imports: [PrismaModule, ProfilesModule],
})
export class FollowModule {}
