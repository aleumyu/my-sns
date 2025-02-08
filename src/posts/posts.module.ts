import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
// import { ProfilesModule } from 'src/profiles/profiles.module';
import { FollowModule } from 'src/follow/follow.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SearchModule } from 'src/search/search.module';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, KafkaProducerService],
  imports: [PrismaModule, FollowModule, SearchModule],
  exports: [PostsService],
})
export class PostsModule {}
