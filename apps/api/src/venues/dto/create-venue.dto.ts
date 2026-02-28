import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @Length(1, 100)
  name!: string;

  @IsString()
  @Length(1, 50)
  sido!: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  sigungu?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  address?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sports?: string[];
}
