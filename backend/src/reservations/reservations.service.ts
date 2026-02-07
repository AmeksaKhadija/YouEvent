import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Reservation, ReservationStatus } from './reservation.entity';
import { Event, EventStatus } from '../events/event.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async create(userId: number, eventId: number): Promise<Reservation> {
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // YOUEV-52: Seuls les événements PUBLISHED peuvent être réservés
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('This event is not open for reservation');
    }

    // Check if user already reserved
    const existingReservation = await this.reservationsRepository.findOne({
      where: {
        user_id: userId,
        event_id: eventId,
        status: In([ReservationStatus.PENDING, ReservationStatus.CONFIRMED]), 
      },
    });

    if (existingReservation) {
      throw new ConflictException('You have already reserved a place for this event');
    }

    // YOUEV-53: Vérifier places disponibles
    const reservationsCount = await this.reservationsRepository.count({
      where: {
        event_id: eventId,
        status: In([ReservationStatus.PENDING, ReservationStatus.CONFIRMED]),
      },
    });

    if (reservationsCount >= event.capacity) {
      throw new BadRequestException('Event is fully booked');
    }

    // YOUEV-54: Statut réservation DRAFT (PENDING)
    const reservation = this.reservationsRepository.create({
      user_id: userId,
      event_id: eventId,
      status: ReservationStatus.PENDING,
    });

    return this.reservationsRepository.save(reservation);
  }


  async findByUser(userId: number): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      where: { user_id: userId },
      relations: ['event'],
      order: { created_at: 'DESC' },
    });
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      relations: ['event', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async updateStatus(id: number, status: ReservationStatus): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({ where: { id } });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    reservation.status = status;
    return this.reservationsRepository.save(reservation);
  }
}
