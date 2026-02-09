import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static'; 
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ReservationsModule } from './reservations/reservations.module';
import { StatsModule } from './stats/stats.module';
import { User } from './users/user.entity';
import { Event } from './events/event.entity'; // Import Event Entity
import { Reservation } from './reservations/reservation.entity'; // Import Reservation Entity
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Event, Reservation], // Add Event to entities
      synchronize: true, // Auto-create tables (DEV ONLY)
    }),
    AuthModule,
    UsersModule,
    EventsModule, // Add EventsModule
    ReservationsModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
