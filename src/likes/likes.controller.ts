import { Controller, Get, Post, Body } from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { CurrentUser } from 'src/current-user.decorator';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  create(
    @CurrentUser('profileId') profileId: string,
    @Body() createLikeDto: CreateLikeDto,
  ) {
    return this.likesService.create(profileId, createLikeDto);
  }

  @Get()
  findAll() {
    return this.likesService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.likesService.findOne(id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto) {
  //   return this.likesService.update(id, updateLikeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.likesService.remove(id);
  // }
}
