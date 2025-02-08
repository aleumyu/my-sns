import { Inject, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { PrismaService } from 'src/prisma/prisma.service';
import { FollowService } from 'src/follow/follow.service';
import SearchService from 'src/search/search.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly followService: FollowService,
    private postsSearchService: SearchService,
    private kafkaProducerService: KafkaProducerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    // Question: how to handle if there is an error and rollback??
    if (post.status === 'SAVED') {
      await this.kafkaProducerService.emitCreatePostEsEvent(post);
      await this.kafkaProducerService.emitCreatePostCacheEvent(profileId, post);
    }

    return post;
  }

  findAll() {
    return `This action returns all posts`;
  }

  async searchForPosts(text: string) {
    const results = await this.postsSearchService.search(text);
    const ids = results.map((result: any) => result.id);
    if (!ids.length) {
      return [];
    }
    return this.prisma.post.findMany({
      where: { id: { in: ids } },
    });
  }

  async findAllNew(profileId: string, limit: number, offset: number) {
    console.log({ profileId });

    // new feeds of the peolple I follow = followees
    const cacheKey = `newFeedsFor:${profileId}`;
    const cachedData: any[] = await this.cacheManager.get(cacheKey);
    let posts: any[] = [];
    if (cachedData) {
      posts = cachedData;
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
      await this.cacheManager.set(cacheKey, posts);
    }

    // const paginatedPosts = posts.slice(offset - 1, offset - 1 + limit);
    return posts;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  // update(id: number, updatePostDto: UpdatePostDto) {
  //   return `This action updates a #${id} post`;
  // }

  // remove(id: number) {
  // should include logic to delete from elasticsearch
  // should include logic to delete from cache
  //   return `This action removes a #${id} post`;
  // }
}
