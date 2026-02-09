import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Event, EventStatus } from '../events/event.entity';
import { Reservation, ReservationStatus } from '../reservations/reservation.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Event) private eventsRepo: Repository<Event>,
    @InjectRepository(Reservation) private reservationsRepo: Repository<Reservation>,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.usersRepo.count();
    const totalEvents = await this.eventsRepo.count();
    const publishedEvents = await this.eventsRepo.count({ where: { status: EventStatus.PUBLISHED } });
    const totalReservations = await this.reservationsRepo.count();
    const pendingReservations = await this.reservationsRepo.count({ where: { status: ReservationStatus.PENDING } });
    const confirmedReservations = await this.reservationsRepo.count({ where: { status: ReservationStatus.CONFIRMED } });

    return {
       totalUsers,
       totalEvents,
       publishedEvents,
       totalReservations,
       pendingReservations,
       confirmedReservations
    };
  }
}
