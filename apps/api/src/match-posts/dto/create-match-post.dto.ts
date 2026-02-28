import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsInt,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateTimeSlotDto } from './create-time-slot.dto';

export class CreateMatchPostDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  hostTeamId!: number;

  @IsString()
  @Length(1, 50)
  venueId!: string;

  @IsString()
  @Length(1, 100)
  title!: string;

  @IsString()
  @Length(1, 2000)
  description!: string;

  @ValidateNested({ each: true })
  @Type(() => CreateTimeSlotDto)
  @ArrayMinSize(1)
  slots!: CreateTimeSlotDto[];
}
