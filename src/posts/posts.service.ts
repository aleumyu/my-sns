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
  ) {}

  async create(profileId: string, createPostDto: CreatePostDto) {
    //create new post
    //get the list of followers of the current user/profile
    //update  their  cache - unshift the new post to the head
    const post = await this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId: profileId,
      },
    });
    console.log({ post });

    const cachedData: any[] = await this.cacheManager.get(profileId);
    console.log({ cachedData });
    if (!cachedData) {
      await this.cacheManager.set(profileId, [post]);
    } else {
      cachedData.unshift(post);
      await this.cacheManager.set(profileId, cachedData);
    }
    return post;
  }

  findAll() {
    return `This action returns all posts`;
  }

  async findAllNew(profileId: string) {
    // cache check
    // if cache is there, return the cache
    //if not,
    //get the list of followees
    //get the list of posts from the followees
    //cache the list of posts in redis
    //return the list of posts
    const follows = await this.followService.findAllFollows(profileId);
    const followeeIds = follows.map((follower) => follower.followeeId);
    // use join to handle N+1 problem
    const posts = await this.prisma.post.findMany({
      relationLoadStrategy: 'join',
      where: {
        authorId: {
          in: followeeIds,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return posts;
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
