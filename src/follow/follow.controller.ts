import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { CurrentUser } from 'src/current-user.decorator';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  create(
    @CurrentUser('profileId') profileId: string,
    @Body() createFollowDto: CreateFollowDto,
  ) {
    return this.followService.create(createFollowDto, profileId);
  }

  @Get()
  findAll(@CurrentUser('userId') userId: string) {
    return this.followService.findAllFollows(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.followService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFollowDto: UpdateFollowDto) {
    return this.followService.update(id, updateFollowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.followService.remove(id);
  }
}
