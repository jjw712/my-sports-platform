import { Type } from 'class-transformer';
import { IsNumber, IsString, Length, Max, Min } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @Length(1, 100)
  name!: string;

  @IsString()
  @Length(1, 200)
  address!: string;

  @IsString()
  @Length(1, 50)
  region!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}
