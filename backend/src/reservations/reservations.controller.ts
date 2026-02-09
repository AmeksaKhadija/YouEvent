import { Controller, Post, Body, UseGuards, Request, Get, Patch, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReservationsService } from './reservations.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReservationStatus } from './reservation.entity';

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

  @Patch(':id/cancel')
  @UseGuards(AuthGuard('jwt'))
  async cancel(@Request() req, @Param('id') id: string) {
    return this.reservationsService.cancelMyReservation(req.user.userId, +id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findAll() {
    return this.reservationsService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: ReservationStatus) {
    return this.reservationsService.updateStatus(+id, status);
  }

  @Get(':id/ticket')
  @UseGuards(AuthGuard('jwt'))
  async downloadTicket(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.reservationsService.generateTicket(req.user.userId, +id);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ticket-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
