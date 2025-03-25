import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';

import Redis from 'ioredis';

import { PrismaService } from 'src/prisma/prisma.service';
import { FollowService } from 'src/follow/follow.service';
import SearchService, { SearchBody } from 'src/search/search.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';

@Injectable()
export class PostsService {
  private readonly redis = new Redis({
    host: 'localhost',
    port: 6379,
  });
  constructor(
    private readonly prisma: PrismaService,
    private readonly followService: FollowService,
    private postsSearchService: SearchService,
    private kafkaProducerService: KafkaProducerService,
  ) {
    // this.onModuleInit();
  }

  // async onModuleInit() {
  //   try {
  //     await this.cacheManager.set('test', 'value');

  //     console.log('Cache test:', {
  //       type: this.cacheManager.constructor,
  //       store: this.cacheManager.stores,
  //       // connection: this.cacheManager.stores?.client?.connected,
  //     });
  //   } catch (error) {
  //     console.error('Cache test failed:', error);
  //   }
  // }

  async create(profileId: string, createPostDto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId: profileId,
      },
    });

    //save to elasticsearch+cache
    if (post.status === 'SAVED') {
      await this.kafkaProducerService.emitCreatePostEsEvent(post);
      await this.kafkaProducerService.emitCreatePostCacheEvent(profileId, post);
    }

    return post;
  }

  findAll() {
    return `This action returns all posts`;
  }

  async searchForPosts(text: string): Promise<SearchBody[]> {
    const results = await this.postsSearchService.search({
      text,
      index: 'posts',
    });
    if (Array.isArray(results)) {
      return results;
    }
    return [];
  }

  async findAllNew(profileId: string, page: number, offset: number) {
    // new feeds of the peolple I follow = followees
    const sortedSetKey = `newFeedsFor:${profileId}`;
    const start = (page - 1) * offset;
    const end = start + offset - 1;
    const cachedData = await this.redis.zrevrange(sortedSetKey, start, end);
    const postsCached = cachedData.map((post) => JSON.parse(post));
    // normal key/value get cache
    // const cacheKey = `newFeedsFor:${profileId}`;
    // const cachedData: any[] = await this.cacheManager.get(cacheKey);
    let posts: any[] = [];
    if (cachedData) {
      posts = postsCached;
    } else {
      const followees = await this.followService.findAllFollowees(profileId);
      posts = await this.prisma.post.findMany({
        where: {
          authorId: {
            in: followees,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      //need to check the logic of this - probably need  to craet another producer
      await this.kafkaProducerService.emitCreatePostCacheEvent(
        profileId,
        posts,
      );

      // await this.cacheManager.set(cacheKey, posts);
    }

    return posts;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }
}
