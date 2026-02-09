import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';
import { Reservation } from '../reservations/reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Event, Reservation])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
