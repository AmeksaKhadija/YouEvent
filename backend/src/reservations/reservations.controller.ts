import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(req.user.userId, createReservationDto.eventId);
  }

  @Get('my-reservations')
  @UseGuards(AuthGuard('jwt'))
  findMyReservations(@Request() req) {
    return this.reservationsService.findByUser(req.user.userId);
  }
}
