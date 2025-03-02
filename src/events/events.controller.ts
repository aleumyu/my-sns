import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  //GET /events/search?keyword={keyword}&start={start_date}&end={end_date}&pageSize={page_size}&page={page_number}
  // QUESTION: is it better to have GET /events and GET /events/search? separate endpoints?
  // or can I use /events/search for all cases so if there is no query param then it will return all events?
  @Get('search')
  search(
    @Query('keyword') keyword?: string,
    @Query('venue') venue?: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('pageSize') pageSize?: number,
    @Query('page') page?: number,
  ) {
    return this.eventsService.search(
      keyword,
      venue,
      start,
      end,
      pageSize,
      page,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
  //   return this.eventsService.update(+id, updateEventDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.eventsService.remove(+id);
  // }
}
