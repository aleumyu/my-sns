import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfilesService } from 'src/profiles/profiles.service';
@Injectable()
export class FollowService {
  constructor(
    private prisma: PrismaService,
    private profilesService: ProfilesService,
  ) {}

  async create(createFollowDto: CreateFollowDto, profileId: string) {
    const alreadyFollowing = await this.prisma.follow.findFirst({
      where: {
        followerId: profileId,
        followeeId: createFollowDto.followeeId,
      },
    });
    if (alreadyFollowing) {
      throw new BadRequestException('User already followed');
    }
    return await this.prisma.follow.create({
      data: {
        followerId: profileId,
        followeeId: createFollowDto.followeeId,
      },
    });
  }

  async findAllFollows(profileId: string) {
    return await this.prisma.follow.findMany({
      where: { followerId: profileId },
    });
  }

  async findAllFollowers(profileId: string) {
    // profileId를 팔로우하는 사람들
    const follows = await this.prisma.follow.findMany({
      where: { followeeId: profileId },
    });
    return follows.map((follow) => follow.followerId);
  }

  async findAllFollowees(profileId: string) {
    //profileId가 팔로우 하는 사람들
    const follows = await this.prisma.follow.findMany({
      where: { followerId: profileId },
    });
    return follows.map((follow) => follow.followeeId);
  }

  findOne(id: string) {
    return `This action returns a #${id} follow`;
  }

  update(id: string, updateFollowDto: UpdateFollowDto) {
    return `This action updates a #${id} follow`;
  }

  remove(id: string) {
    return `This action removes a #${id} follow`;
  }
}
