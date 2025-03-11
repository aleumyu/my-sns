import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CurrentUser } from 'src/current-user.decorator';

@Controller('posts')
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
}
