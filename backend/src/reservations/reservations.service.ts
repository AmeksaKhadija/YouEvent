import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Reservation, ReservationStatus } from './reservation.entity';
import { Event, EventStatus } from '../events/event.entity';
import { User } from '../users/user.entity';
import * as PDFDocument from 'pdfkit';

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

    // Decrement event capacity (as requested by user)
    // Note: capacity represents "available seats" in this context as per request
    event.capacity = event.capacity - 1;
    await this.eventsRepository.save(event);

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

  async cancelMyReservation(userId: number, reservationId: number): Promise<void> {
    const reservation = await this.reservationsRepository.findOne({ 
        where: { id: reservationId, user_id: userId } 
    });

    if (!reservation) {
        throw new NotFoundException('Reservation not found');
    }

    if (reservation.status === ReservationStatus.CANCELED) {
        throw new BadRequestException('Reservation is already canceled');
    }

    reservation.status = ReservationStatus.CANCELED;
    await this.reservationsRepository.save(reservation);
  }

  async generateTicket(userId: number, reservationId: number): Promise<Buffer> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId, user_id: userId },
      relations: ['event', 'user'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // YOUEV-60: Téléchargement uniquement si CONFIRMED
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Ticket download is only available for confirmed reservations');
    }

    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // YOUEV-61: PDF contient infos événement + participant
      // Header
      doc.fontSize(25).font('Helvetica-Bold').text('TICKET EVENEMENT', { align: 'center' });
      doc.moveDown();
      
      // Event Details
      doc.fontSize(18).font('Helvetica').fillColor('black').text(`Event: ${reservation.event.title}`);
      doc.fontSize(14).text(`Date: ${new Date(reservation.event.date).toLocaleDateString()} ${new Date(reservation.event.date).toLocaleTimeString()}`);
      doc.text(`Location: ${reservation.event.location}`);
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Separator line
      doc.moveDown();

      // Participant Details
      doc.fontSize(16).font('Helvetica-Bold').text('Participant Info:');
      doc.fontSize(14).font('Helvetica').text(`Name: ${reservation.user.name}`);
      doc.text(`Email: ${reservation.user.email}`);
      doc.moveDown();
      doc.moveDown();

      // Status Badge
      doc.rect(400, 100, 150, 40).fillAndStroke('green', 'black');
      doc.fillColor('white').fontSize(16).text('CONFIRMED', 425, 112);
      
      // Footer
      doc.fillColor('black').fontSize(10).text(`Ticket ID: #${reservation.id}`, 50, 700);
      doc.text('This ticket is valid for one person.', 50, 715);
      
      doc.end();
    });
  }
}
