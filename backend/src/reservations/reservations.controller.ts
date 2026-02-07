import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { AuthGuard } from '@nestjs/passport'; // Assumed from context
import { CreateReservationDto } from './dto/create-reservation.dto'; // Need to create this

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() body: { eventId: number }) {
    // req.user is populated by AuthGuard (Passport)
    return this.reservationsService.create(req.user.userId, body.eventId);
  }

  @Get('my-reservations')
  @UseGuards(AuthGuard('jwt'))
  findMyReservations(@Request() req) {
    return this.reservationsService.findByUser(req.user.userId);
  }
}
