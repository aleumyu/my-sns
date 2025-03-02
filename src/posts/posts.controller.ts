import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  // Patch,
  // Param,
  // Delete,
  // UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
// import { AuthGuard } from 'src/auth.guard';
import { CurrentUser } from 'src/current-user.decorator';

@Controller('posts')
// @UseGuards(AuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(
    @CurrentUser('profileId') profileId: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(profileId, createPostDto);
  }

  //고치기
  @Get()
  findAll(@Query('search') search: string) {
    if (search) {
      return this.postsService.searchForPosts(search);
    }
    return this.postsService.findAll();
  }

  @Get('new')
  findAllNew(
    @CurrentUser('profileId') profileId: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    return this.postsService.findAllNew(profileId, page, offset);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.postsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   return this.postsService.update(+id, updatePostDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.postsService.remove(+id);
  // }
}
