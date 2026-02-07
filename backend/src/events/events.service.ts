import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventsRepository.create({
      ...createEventDto,
      status: EventStatus.DRAFT, // YOUEV-38: Statut initial DRAFT
    });
    return this.eventsRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    // Removed check for PUBLISHED status to allow modification
    // if (event.status === EventStatus.PUBLISHED) {
    //   throw new BadRequestException('Cannot modify a published event');
    // }

    this.eventsRepository.merge(event, updateEventDto);
    return this.eventsRepository.save(event);
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }

  async publish(id: number): Promise<Event> {
    const event = await this.findOne(id);
    event.status = EventStatus.PUBLISHED;
    return this.eventsRepository.save(event);
  }

  async cancel(id: number): Promise<Event> {
    const event = await this.findOne(id);
    event.status = EventStatus.CANCELED;
    return this.eventsRepository.save(event);
  }

  async findPublished(): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { status: EventStatus.PUBLISHED },
      order: { date: 'ASC' },
    });
  }
}
