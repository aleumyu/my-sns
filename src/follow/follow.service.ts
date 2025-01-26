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

  async create(createFollowDto: CreateFollowDto, userId: string) {
    const followerProfile = await this.profilesService.findOne(userId);
    const alreadyFollowing = await this.prisma.follow.findFirst({
      where: {
        followerId: followerProfile.id,
        followeeId: createFollowDto.followeeId,
      },
    });
    if (alreadyFollowing) {
      throw new BadRequestException('User already followed');
    }
    return await this.prisma.follow.create({
      data: {
        followerId: followerProfile.id,
        followeeId: createFollowDto.followeeId,
      },
    });
  }

  async findAllFollowers(followeeId: string) {
    return await this.prisma.follow.findMany({ where: { followeeId } });
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
