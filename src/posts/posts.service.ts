import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FollowService } from 'src/follow/follow.service';
@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly followService: FollowService,
  ) {}

  async create(profileId: string, createPostDto: CreatePostDto) {
    return await this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId: profileId,
      },
    });
  }

  findAll() {
    return `This action returns all posts`;
  }

  async findAllNew(profileId: string) {
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
