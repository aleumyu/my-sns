import { ConflictException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CreateLikeDto } from './dto/create-like.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikesService {
  private likeQueue: { profileId: string; postId: string }[] = [];
  private static BATCH_SIZE = 10;

  constructor(private readonly prisma: PrismaService) {}

  async create(profileId: string, createLikeDto: CreateLikeDto) {
    const existingLike = await this.findOne(profileId, createLikeDto.postId);
    if (existingLike) {
      throw new ConflictException('You already liked this post');
    }

    this.likeQueue.push({ profileId, postId: createLikeDto.postId });

    if (this.likeQueue.length >= LikesService.BATCH_SIZE) {
      await this.processQueue();
    }

    return { queued: true };
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  private async processRemainingLikes() {
    if (this.likeQueue.length > 0) {
      await this.processQueue();
    }
  }

  private async processQueue() {
    const batch = this.likeQueue.splice(0, LikesService.BATCH_SIZE);
    if (batch.length === 0) return;

    await this.prisma.like.createMany({
      data: batch.map(({ profileId, postId }) => ({
        likedBy: profileId,
        postId,
      })),
      skipDuplicates: true,
    });
  }

  findAll() {
    return `This action returns all likes`;
  }

  async findOne(profileId: string, postId: string) {
    return await this.prisma.like.findFirst({
      where: {
        postId,
        likedBy: profileId,
      },
    });
  }
}
