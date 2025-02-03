import { Inject, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FollowService } from 'src/follow/follow.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly followService: FollowService,
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

    const followers = await this.followService.findAllFollowers(profileId);
    for (const followerId of followers) {
      const cacheKey = `newFeedsFor:${profileId}`;
      const cachedData: any[] = await this.cacheManager.get(followerId);
      if (!cachedData) {
        await this.cacheManager.set(cacheKey, [post]);
        console.log(`Set new cache for ${cacheKey}`);
      } else {
        cachedData.unshift(post);
        await this.cacheManager.set(profileId, cachedData);
      }
    }
    return post;
  }

  findAll() {
    return `This action returns all posts`;
  }

  async findAllNew(profileId: string) {
    console.log({ profileId });

    // new feeds of the peolple I follow = followees
    const cacheKey = `newFeedsFor:${profileId}`;
    const cachedData: any[] = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    } else {
      const followees = await this.followService.findAllFollowees(profileId);
      const posts = await this.prisma.post.findMany({
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
      return posts;
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} post`;
  // }

  // update(id: number, updatePostDto: UpdatePostDto) {
  //   return `This action updates a #${id} post`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} post`;
  // }
}
