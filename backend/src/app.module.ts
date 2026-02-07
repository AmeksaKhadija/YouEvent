import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module'; // Import EventsModule
import { User } from './users/user.entity';
import { Event } from './events/event.entity'; // Import Event Entity
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Event], // Add Event to entities
      synchronize: true, // Auto-create tables (DEV ONLY)
    }),
    AuthModule,
    UsersModule,
    EventsModule, // Add EventsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
