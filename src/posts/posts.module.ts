import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
// import { ProfilesModule } from 'src/profiles/profiles.module';
import { FollowModule } from 'src/follow/follow.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SearchModule } from 'src/search/search.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [PrismaModule, FollowModule, SearchModule],
})
export class PostsModule {}
