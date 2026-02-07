import { Controller, Post, Body, UseGuards, Get, Put, Delete, Patch, Param, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './public/uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  create(@Body() createEventDto: CreateEventDto, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      createEventDto.imageUrl = `http://localhost:8000/uploads/${file.filename}`;
    }
    if (createEventDto.capacity && typeof createEventDto.capacity === 'string') {
      createEventDto.capacity = parseInt(createEventDto.capacity, 10);
    }
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
