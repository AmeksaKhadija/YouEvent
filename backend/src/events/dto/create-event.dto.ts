import { IsNotEmpty, IsString, IsDateString, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNotEmpty()
  @IsDateString()
  date: string; // ISO 8601 date string

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Transform string payload to number if necessary
  capacity: number;
}
