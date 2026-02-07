import { Controller, Post, Body, UseGuards, Get, Put, Delete, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin') // Seul l'admin peut créer un événement
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('published')
  findPublished() {
    return this.eventsService.findPublished();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }

  @Patch(':id/publish')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.publish(id);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.cancel(id);
  }
}
