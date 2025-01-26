import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
// import { ProfilesModule } from 'src/profiles/profiles.module';
import { FollowModule } from 'src/follow/follow.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [PrismaModule, FollowModule],
})
export class PostsModule {}
