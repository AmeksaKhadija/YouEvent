import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  eventId: number;
}
